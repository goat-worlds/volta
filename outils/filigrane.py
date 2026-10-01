"""
Incruste le filigrane VOLTA dans les photos du catalogue.

Le filigrane ne portait que « VOLTA ». La marque s'écrit avec sa maison —
« VOLTA / by GÉNIE SÉLECT » — partout où elle apparaît : sur le logo, dans
l'en-tête, et donc aussi sur les images. Une photo reprise ailleurs doit dire
d'où elle vient, pas seulement qui l'a publiée.

Le traitement repart toujours de `sources-images/`, jamais d'une image déjà
filigranée : c'est ce qui le rend rejouable sans superposer deux marquages.

La couleur est choisie d'après la luminance de la zone que le texte va
occuper, pas fixée d'avance : un filigrane blanc sur un ciel clair ne se
verrait pas, et une valeur unique échouerait sur la moitié du catalogue.

Les dimensions, le ratio et la résolution restent inchangés — le texte est
dessiné *dans* l'image, jamais dans une bande ajoutée.

    python outils/filigrane.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageStat

RACINE = Path(__file__).resolve().parent.parent
SOURCES = RACINE.parent / "volta-junior" / "sources-images"
SORTIE = RACINE / "public" / "engins"

MARQUE = "VOLTA"
MAISON = "by GÉNIE SÉLECT"

# Polices : une gras pour la marque, une normale pour la maison.
GRAS = Path(r"C:\Windows\Fonts\arialbd.ttf")
NORMALE = Path(r"C:\Windows\Fonts\arial.ttf")


def police(chemin: Path, taille: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(chemin), taille)


def couleur_opposee(image: Image.Image, boite: tuple[int, int, int, int]) -> tuple[int, int, int]:
    """Blanc sur fond sombre, gris très foncé sur fond clair."""
    zone = image.crop(boite).convert("L")
    if zone.width == 0 or zone.height == 0:
        return (255, 255, 255)
    moyenne = ImageStat.Stat(zone).mean[0]
    return (255, 255, 255) if moyenne < 128 else (26, 26, 26)


def filigraner(source: Path, cible: Path) -> None:
    image = Image.open(source).convert("RGB")
    L, H = image.size

    # Le filigrane se dimensionne sur la largeur : une taille en pixels fixe
    # serait énorme sur une vignette et invisible sur une photo pleine page.
    taille_marque = max(14, int(L * 0.045))
    taille_maison = max(8, int(taille_marque * 0.42))

    f_marque = police(GRAS, taille_marque)
    f_maison = police(NORMALE, taille_maison)

    calque = Image.new("RGBA", image.size, (0, 0, 0, 0))
    dessin = ImageDraw.Draw(calque)

    l_marque = dessin.textlength(MARQUE, font=f_marque)
    l_maison = dessin.textlength(MAISON, font=f_maison)
    largeur = max(l_marque, l_maison)
    hauteur = taille_marque + taille_maison + int(taille_marque * 0.25)

    marge = int(L * 0.025)
    x = L - largeur - marge
    y = H - hauteur - marge

    # La teinte est mesurée sur le bloc entier : les deux lignes partagent le
    # même fond, les séparer donnerait parfois deux couleurs sur deux lignes
    # collées.
    boite = (int(x), int(y), int(min(L, x + largeur)), int(min(H, y + hauteur)))
    teinte = couleur_opposee(image, boite)

    # Les deux lignes sont alignées à droite : c'est le bord de l'image qui
    # sert de repère, et « by GÉNIE SÉLECT » est plus court que « VOLTA » sur
    # certaines tailles, plus long sur d'autres.
    dessin.text((x + largeur - l_marque, y), MARQUE, font=f_marque, fill=teinte + (168,))
    dessin.text(
        (x + largeur - l_maison, y + taille_marque + int(taille_marque * 0.18)),
        MAISON,
        font=f_maison,
        fill=teinte + (150,),
    )

    image = Image.alpha_composite(image.convert("RGBA"), calque).convert("RGB")
    cible.parent.mkdir(parents=True, exist_ok=True)
    image.save(cible, "JPEG", quality=90, optimize=True)


def main() -> None:
    if not SOURCES.is_dir():
        raise SystemExit(f"Originaux introuvables : {SOURCES}")

    traitees = 0
    for source in sorted(SOURCES.glob("*.jpeg")):
        filigraner(source, SORTIE / source.name)
        print(f"  {source.name}")
        traitees += 1
    print(f"{traitees} photos filigranées dans {SORTIE}")


if __name__ == "__main__":
    main()
