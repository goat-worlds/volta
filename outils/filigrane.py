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

LOGO = RACINE / "public" / "images" / "logo-volta.png"
SITE_NAV = RACINE / "src" / "lib" / "siteNav.ts"

MARQUE = "VOLTA"
MAISON = "by GÉNIE SÉLECT"

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
    image = Image.open(source).convert("RGB")
    L, H = image.size

    # Le filigrane se dimensionne sur la largeur : une taille en pixels fixe
    # serait énorme sur une vignette et invisible sur une photo pleine page.
    #
    # Le mot VOLTA n'est plus écrit en texte : le logo le porte déjà, en plus
    # grand et dans ses couleurs. L'écrire à côté le donnait deux fois, et le
    # pavé occupait un quart de la photo. Restent la maison et le numéro —
    # ce que le dessin ne dit pas.
    taille_maison = max(9, int(L * 0.020))

    f_maison = police(NORMALE, taille_maison)

    calque = Image.new("RGBA", image.size, (0, 0, 0, 0))
    dessin = ImageDraw.Draw(calque)

    l_maison = dessin.textlength(MAISON, font=f_maison)
    l_tel = dessin.textlength(tel, font=f_maison)
    largeur = max(l_maison, l_tel)

    interligne = max(2, int(taille_maison * 0.30))
    hauteur = taille_maison * 2 + interligne

    marge = int(L * 0.025)
    x = L - largeur - marge
    y = H - hauteur - marge

    # La teinte est mesurée sur le bloc entier : les deux lignes partagent le
    # même fond, les séparer donnerait parfois deux couleurs sur deux lignes
    # collées.
    boite = (int(x), int(y), int(min(L, x + largeur)), int(min(H, y + hauteur)))
    teinte = couleur_opposee(image, boite)

    # Les deux lignes sont alignées à droite : c'est le bord de l'image qui sert
    # de repère, et « by GÉNIE SÉLECT » est plus court que le numéro sur
    # certaines tailles, plus long sur d'autres.
    dessin.text((x + largeur - l_maison, y), MAISON, font=f_maison, fill=teinte + (205,))
    dessin.text(
        (x + largeur - l_tel, y + taille_maison + interligne),
        tel,
        font=f_maison,
        fill=teinte + (225,),
    )

    image = Image.alpha_composite(image.convert("RGBA"), calque)

    # Le logo à gauche du bloc de texte, centré sur sa hauteur. Il garde ses
    # couleurs et son ombre : c'est lui qu'on reconnaît avant de lire.
    hauteur_logo = max(18, min(int(L * 0.052), int(H * 0.125)))
    logo = avec_ombre(logo_marque(hauteur_logo))
    image.alpha_composite(
        logo,
        (
            max(0, int(x) - logo.width + int(taille_maison * 0.4)),
            int(y + (hauteur - logo.height) / 2),
        ),
    )

    image = image.convert("RGB")
    cible.parent.mkdir(parents=True, exist_ok=True)
    image.save(cible, "JPEG", quality=90, optimize=True)


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

    print(f"{traitees} photos filigranées dans {SORTIE}")
    if args.lsb:
        print(f"Masters tatoués : {MASTERS}  (relire avec --lire)")


if __name__ == "__main__":
    main()
