"""
Incruste le filigrane VOLTA dans les photos du catalogue.

Le filigrane ne portait que « VOLTA ». La marque s'écrit avec sa maison —
« VOLTA / by GÉNIE SÉLECT » — partout où elle apparaît : sur le logo, dans
l'en-tête, et donc aussi sur les images. Une photo reprise ailleurs doit dire
d'où elle vient, pas seulement qui l'a publiée.

Elle le dit maintenant avec le logo dessiné et le numéro de la maison, parce
qu'un nom seul n'est pas joignable : qui tombe sur la photo doit pouvoir
appeler sans chercher le site.

Le traitement repart toujours de `sources-images/`, jamais d'une image déjà
filigranée : c'est ce qui le rend rejouable sans superposer deux marquages.

La couleur du texte est choisie d'après la luminance de la zone qu'il va
occuper, pas fixée d'avance : un filigrane blanc sur un ciel clair ne se
verrait pas, et une valeur unique échouerait sur la moitié du catalogue.

Les dimensions, le ratio et la résolution restent inchangés — le texte est
dessiné *dans* l'image, jamais dans une bande ajoutée.

<h2>Deux protections, qui ne couvrent pas les mêmes risques</h2>

Le FILIGRANE VISIBLE survit à la capture d'écran, au recadrage partiel et au
ré-encodage. C'est la seule protection qui tienne quand quelqu'un capture
l'écran : c'est donc elle qui porte la marque au quotidien.

Le TATOUAGE LSB cache une signature dans le bit de poids faible des pixels. Il
prouve l'origine d'un *fichier*, et seulement d'un fichier transmis tel quel :
le JPEG le détruit (la compression avec perte réécrit les pixels), une capture
d'écran le détruit (l'image est rééchantillonnée à l'affichage), un recadrage
le détruit. Il ne vaut donc que sur les masters PNG, qui ne partent pas sur le
web et servent de preuve. Ce n'est pas lui qui protège les captures d'écran.

    python outils/filigrane.py           # filigrane visible
    python outils/filigrane.py --lsb     # + masters PNG tatoués
    python outils/filigrane.py --lire    # relit les tatouages posés
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat

RACINE = Path(__file__).resolve().parent.parent
SOURCES = RACINE.parent / "volta-junior" / "sources-images"
SORTIE = RACINE / "public" / "engins"
MASTERS = RACINE.parent / "volta-junior" / "masters-tatoues"

# Les images de remplacement, affichées à la place d'une photo absente.
REMPLACEMENTS = RACINE / "public" / "images" / "placeholders"

LOGO = RACINE / "public" / "images" / "logo-volta.png"
SITE_NAV = RACINE / "src" / "lib" / "siteNav.ts"

MARQUE = "VOLTA"
MAISON = "by GÉNIE SÉLECT DIGITAL"

# Polices : une gras pour la marque, une normale pour la maison.
GRAS = Path(r"C:\Windows\Fonts\arialbd.ttf")
NORMALE = Path(r"C:\Windows\Fonts\arial.ttf")

EN_TETE = b"VLT1"


def police(chemin: Path, taille: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(chemin), taille)


def telephone() -> str:
    """
    Le numéro affiché par le site, lu à sa source.

    Le recopier ici créerait un second endroit à tenir à jour : le jour où le
    numéro change, les images continueraient d'afficher l'ancien pendant des
    mois sans que personne s'en aperçoive. Il n'y a qu'un numéro VOLTA, et il
    est déclaré dans `siteNav.ts`.
    """
    texte = SITE_NAV.read_text(encoding="utf-8")
    trouve = re.search(r"TELEPHONE\s*=\s*\{[^}]*affiche:\s*'([^']+)'", texte)
    if not trouve:
        raise SystemExit("Numéro introuvable dans src/lib/siteNav.ts (constante TELEPHONE).")
    return trouve.group(1)


def logo_marque(hauteur: int) -> Image.Image:
    """
    Le logo dessiné, recadré sur son encre.

    Le fichier est transparent sur une bonne part de son cadre : mis à l'échelle
    tel quel, le dessin visible ferait une fraction imprévisible de la hauteur
    demandée, et rien ne s'alignerait à côté. `getbbox` rend la boîte réellement
    encrée — à partir de là, une hauteur demandée est une hauteur obtenue.

    Les couleurs sont conservées. Les aplatir en silhouette blanche a été
    essayé : le V orange surmontant le VOLTA noir devenait une tache sans
    identité. C'est l'ombre portée qui se charge de le détacher des fonds
    clairs, pas un changement de teinte.
    """
    logo = Image.open(LOGO).convert("RGBA")

    encre = logo.getchannel("A").getbbox()
    if encre:
        logo = logo.crop(encre)

    ratio = hauteur / logo.height
    return logo.resize((max(1, int(logo.width * ratio)), hauteur), Image.LANCZOS)


def avec_ombre(calque: Image.Image, rayon: int = 3) -> Image.Image:
    """
    Double le calque d'une ombre noire floue.

    Sans elle, le logo se perd sur un ciel surexposé ou un bardage clair : il ne
    tiendrait que sur les photos sombres.
    """
    marge = rayon * 4
    fond = Image.new("RGBA", (calque.width + marge * 2, calque.height + marge * 2), (0, 0, 0, 0))

    ombre = Image.new("RGBA", fond.size, (0, 0, 0, 0))
    ombre.paste((0, 0, 0, 170), (marge, marge), calque.getchannel("A"))
    ombre = ombre.filter(ImageFilter.GaussianBlur(rayon))

    fond.alpha_composite(ombre)
    fond.alpha_composite(calque, (marge, marge))
    return fond


def couleur_opposee(image: Image.Image, boite: tuple[int, int, int, int]) -> tuple[int, int, int]:
    """Blanc sur fond sombre, gris très foncé sur fond clair."""
    zone = image.crop(boite).convert("L")
    if zone.width == 0 or zone.height == 0:
        return (255, 255, 255)
    moyenne = ImageStat.Stat(zone).mean[0]
    return (255, 255, 255) if moyenne < 128 else (26, 26, 26)


def filigraner(source: Path, cible: Path, tel: str) -> None:
    """
    Incruste la marque au centre de la photo.

    <h2>Pourquoi au centre</h2>

    Elle vivait dans le coin bas droit. C'est l'endroit le plus discret, et
    c'est tout le problème : on recadre un coin en deux gestes, et la photo
    repart sans sa marque. Le but n'est pas de signer poliment, c'est de rendre
    l'image inutilisable ailleurs — et seul le centre ne peut pas être enlevé
    sans emporter l'engin avec lui.

    <h2>Pourquoi on voit encore l'engin</h2>

    Une marque opaque en plein milieu protégerait parfaitement une photo que
    plus personne ne regarde. Le bloc est donc posé à faible opacité : assez
    présent pour décourager la reprise, assez transparent pour qu'un loueur
    juge la machine. C'est le compromis que fait tout catalogue en ligne.

    La composition est celle des huit vignettes de l'accueil — symbole, VOLTA,
    la maison, le numéro — pour que la marque soit la même partout.
    """
    image = Image.open(source).convert("RGB")
    L, H = image.size

    # Le bloc occupe une fraction de la largeur, bornée par la hauteur : les
    # photos vont du carré au bandeau 5:1, et un même pourcentage n'y veut pas
    # dire la même chose.
    largeur_cible = min(L * 0.46, H * 1.30)

    hauteur_logo = max(24, int(largeur_cible * 0.26))
    corps_marque = max(16, int(largeur_cible * 0.17))
    corps_petit = max(9, int(corps_marque * 0.34))

    logo = logo_marque(hauteur_logo)
    f_marque = police(GRAS, corps_marque)
    f_petit = police(NORMALE, corps_petit)

    regle = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    b_marque = regle.textbbox((0, 0), MARQUE, font=f_marque)
    b_maison = regle.textbbox((0, 0), MAISON, font=f_petit)
    b_tel = regle.textbbox((0, 0), tel, font=f_petit)

    h_marque = b_marque[3] - b_marque[1]
    h_maison = b_maison[3] - b_maison[1]
    h_tel = b_tel[3] - b_tel[1]
    interligne = max(3, corps_petit // 2)

    l_bloc = max(logo.width, b_marque[2] - b_marque[0], b_maison[2] - b_maison[0], b_tel[2] - b_tel[0])
    h_bloc = hauteur_logo + interligne + h_marque + interligne + h_maison + interligne + h_tel

    bloc = Image.new("RGBA", (l_bloc, h_bloc), (0, 0, 0, 0))
    bloc.alpha_composite(logo, ((l_bloc - logo.width) // 2, 0))

    plume = ImageDraw.Draw(bloc)
    # Le liseré sombre tient sous le blanc quel que soit le fond : au centre
    # d'une photo, la luminance change d'un bout à l'autre du bloc, et une
    # teinte choisie sur la moyenne y échouerait une fois sur deux.
    contour = (0, 0, 0, 170)
    trait = max(1, corps_marque // 14)

    y = hauteur_logo + interligne
    for texte, fonte, boite, hauteur in (
        (MARQUE, f_marque, b_marque, h_marque),
        (MAISON, f_petit, b_maison, h_maison),
        (tel, f_petit, b_tel, h_tel),
    ):
        largeur_texte = boite[2] - boite[0]
        plume.text(
            ((l_bloc - largeur_texte) // 2 - boite[0], y - boite[1]),
            texte,
            font=fonte,
            fill=(255, 255, 255, 255),
            stroke_width=trait,
            stroke_fill=contour,
        )
        y += hauteur + interligne

    # L'opacité d'ensemble, appliquée en dernier : elle doit porter sur le bloc
    # composé, liseré compris, sinon le contour reste net sous un texte pâli.
    bloc.putalpha(bloc.getchannel("A").point(lambda a: int(a * 0.42)))

    image = image.convert("RGBA")
    image.alpha_composite(bloc, ((L - l_bloc) // 2, (H - h_bloc) // 2))

    image = image.convert("RGB")
    cible.parent.mkdir(parents=True, exist_ok=True)
    image.save(cible, "JPEG", quality=90, optimize=True)


# Repères qui encadrent le filigrane dans un SVG : ils permettent de le
# remplacer à chaque passage au lieu d'en empiler un nouveau.
SVG_DEBUT = "<!-- filigrane VOLTA : genere par outils/filigrane.py -->"
SVG_FIN = "<!-- fin filigrane VOLTA -->"


def filigraner_svg(chemin: Path, tel: str) -> None:
    """
    Incruste la marque dans une image de remplacement.

    Ces SVG s'affichent partout où une photo manque — cartes du catalogue,
    annonces du Market, fiches sans visuel. Ce sont des images du site comme les
    autres, et elles sortaient nues.

    Le symbole n'y est pas repris : un SVG affiché par une balise `img` ne charge
    aucune ressource extérieure, et embarquer le PNG en base64 pèserait plus que
    l'image elle-même. Le nom est donc écrit en toutes lettres — c'est le seul
    cas du site où le mot VOLTA est composé plutôt que dessiné.
    """
    texte = chemin.read_text(encoding="utf-8")

    # Un passage précédent est remplacé, jamais doublé.
    if SVG_DEBUT in texte:
        avant, reste = texte.split(SVG_DEBUT, 1)
        texte = avant + reste.split(SVG_FIN, 1)[1]

    boite = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', texte)
    if not boite:
        raise SystemExit(f"viewBox introuvable dans {chemin.name}")
    largeur, hauteur = float(boite.group(1)), float(boite.group(2))

    corps = max(7.0, largeur * 0.052)
    petit = corps * 0.62
    marge = largeur * 0.04
    bas = hauteur - marge

    filigrane = f"""{SVG_DEBUT}
  <g text-anchor="end" font-family="system-ui, -apple-system, Segoe UI, sans-serif"
     paint-order="stroke" stroke="#ffffff" stroke-width="{corps * 0.16:.2f}"
     stroke-linejoin="round">
    <text x="{largeur - marge:.1f}" y="{bas - petit * 1.5:.1f}"
          font-size="{corps:.1f}" font-weight="800" fill="#0b1f3a">VOLTA</text>
    <text x="{largeur - marge:.1f}" y="{bas - petit * 0.3:.1f}"
          font-size="{petit:.1f}" font-weight="600" fill="#334155">by GENIE SELECT</text>
    <text x="{largeur - marge:.1f}" y="{bas + petit * 0.9:.1f}"
          font-size="{petit:.1f}" font-weight="600" fill="#334155">{tel}</text>
  </g>
  {SVG_FIN}"""

    texte = texte.replace("</svg>", filigrane + chr(10) + "</svg>")
    chemin.write_text(texte, encoding="utf-8")


def signature(nom: str, tel: str) -> str:
    """Ce que le tatouage transporte : de quoi identifier l'origine du fichier."""
    return json.dumps(
        {"marque": MARQUE, "par": MAISON, "tel": tel, "fichier": nom, "pose": date.today().isoformat()},
        separators=(",", ":"),
        ensure_ascii=False,
    )


def tatouer(source: Path, cible: Path, message: str) -> None:
    """
    Écrit le message dans le bit de poids faible des composantes RVB.

    Un en-tête et la longueur précèdent la charge : sans eux, la relecture ne
    saurait ni si l'image est tatouée ni où s'arrêter, et retournerait le bruit
    des pixels suivants.

    La sortie est un PNG, et ce n'est pas un détail de confort : en JPEG, la
    compression avec perte réécrit les pixels et efface le tatouage au moment
    même de l'enregistrement.
    """
    corps = message.encode("utf-8")
    donnees = EN_TETE + len(corps).to_bytes(4, "big") + corps
    bits = "".join(format(octet, "08b") for octet in donnees)

    image = Image.open(source).convert("RGB")
    octets = bytearray(image.tobytes())
    if len(bits) > len(octets):
        raise ValueError(f"Image trop petite pour {len(donnees)} octets de signature.")

    for i, bit in enumerate(bits):
        octets[i] = (octets[i] & ~1) | int(bit)

    cible.parent.mkdir(parents=True, exist_ok=True)
    Image.frombytes("RGB", image.size, bytes(octets)).save(cible, "PNG", optimize=True)


def lire_tatouage(chemin: Path) -> str | None:
    """Relit une signature, ou None si l'image n'en porte pas."""
    bits = [octet & 1 for octet in Image.open(chemin).convert("RGB").tobytes()]

    def octets(debut: int, combien: int) -> bytes:
        tranche = bits[debut : debut + combien * 8]
        if len(tranche) < combien * 8:
            return b""
        return bytes(
            int("".join(str(x) for x in tranche[i : i + 8]), 2) for i in range(0, len(tranche), 8)
        )

    if octets(0, 4) != EN_TETE:
        return None
    taille = int.from_bytes(octets(32, 4), "big")
    if taille <= 0 or taille > 1_000_000:
        return None
    return octets(64, taille).decode("utf-8", errors="replace")


def main() -> None:
    parse = argparse.ArgumentParser(description="Filigrane des photos VOLTA.")
    parse.add_argument("--lsb", action="store_true", help="produit aussi des masters PNG tatoués")
    parse.add_argument("--lire", action="store_true", help="relit les tatouages posés")
    args = parse.parse_args()

    if args.lire:
        if not MASTERS.is_dir():
            raise SystemExit("Aucun master tatoué. Lancer d'abord : python outils/filigrane.py --lsb")
        for png in sorted(MASTERS.glob("*.png")):
            print(f"  {png.name} -> {lire_tatouage(png) or 'aucun tatouage'}")
        return

    if not SOURCES.is_dir():
        raise SystemExit(f"Originaux introuvables : {SOURCES}")

    tel = telephone()
    print(f"Numéro lu dans siteNav.ts : {tel}")

    traitees = 0
    for source in sorted(SOURCES.glob("*.jpeg")):
        cible = SORTIE / source.name
        filigraner(source, cible, tel)
        if args.lsb:
            tatouer(cible, MASTERS / f"{source.stem}.png", signature(source.name, tel))
        print(f"  {source.name}")
        traitees += 1

    svg = 0
    if REMPLACEMENTS.is_dir():
        for image in sorted(REMPLACEMENTS.glob("*.svg")):
            filigraner_svg(image, tel)
            print(f"  {image.name}")
            svg += 1

    print(f"{traitees} photos et {svg} image(s) de remplacement filigranées")
    if args.lsb:
        print(f"Masters tatoués : {MASTERS}  (relire avec --lire)")


if __name__ == "__main__":
    main()
