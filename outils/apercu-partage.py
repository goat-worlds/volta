"""Fabrique l'image d'aperçu de partage.

Ce qu'une vignette de partage doit supporter, et que le logo du site ne
supporte pas tel quel :

- **Un fond opaque.** Le logo est un PNG transparent. WhatsApp, Facebook et
  LinkedIn aplatissent la transparence sur un fond qu'ils choisissent eux-mêmes
  — blanc ici, noir là. Le mot « VOLTA », écrit en anthracite, disparaissait sur
  les fonds sombres.

- **Un format fixe de 1200 × 630.** C'est le rapport que les aperçus attendent.
  Le logo fait 1774 × 887, soit 2:1 : donné tel quel, il est recadré au hasard
  et le « V » se retrouve coupé.

- **Une marge.** Les applications rognent les bords, et davantage sur mobile.
  Le logo occupe donc 68 % de la largeur, centré, ce qui laisse de quoi mordre
  sans entamer la marque.

Relancer après toute modification du logo :

    python outils/apercu-partage.py
"""

from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
LOGO = RACINE / "public" / "images" / "logo-volta.png"
SORTIE = RACINE / "public" / "og-volta.png"

# Le format qu'attendent les aperçus de lien.
LARGEUR, HAUTEUR = 1200, 630

# Blanc, comme la barre de navigation du site.
#
# Le bleu nuit du manifeste avait été essayé d'abord : le « V » orange y
# ressortait très bien, mais le mot « VOLTA » est dessiné en anthracite et
# devenait illisible. Une vignette de partage qui perd le nom de la marque ne
# sert à rien — c'est le seul mot que le lecteur doit retenir.
FOND = (255, 255, 255)

# Part de la largeur occupée par le logo. Au-delà, les rognages des
# applications de messagerie entament la marque.
PART = 0.68


def main() -> None:
    logo = Image.open(LOGO).convert("RGBA")

    largeur_cible = int(LARGEUR * PART)
    hauteur_cible = round(logo.height * largeur_cible / logo.width)
    logo = logo.resize((largeur_cible, hauteur_cible), Image.LANCZOS)

    toile = Image.new("RGB", (LARGEUR, HAUTEUR), FOND)
    # Collé avec son canal alpha pour masque : sans cela, les bords du « V »
    # sortent cernés d'un liseré clair hérité du détourage.
    toile.paste(logo, ((LARGEUR - largeur_cible) // 2, (HAUTEUR - hauteur_cible) // 2), logo)

    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    toile.save(SORTIE, "PNG", optimize=True)
    print(f"{SORTIE.relative_to(RACINE)} — {LARGEUR}×{HAUTEUR}, {SORTIE.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
