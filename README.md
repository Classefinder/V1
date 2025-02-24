Pour avoir son propre plan, il y a 2 étapes :
Préparer le fichier avec les salles
Préparer les fichiers avec les itinéraire

Pour récupérer les plans d'un établissement facilement, il y a les plans d'évacuations.

Il faut deux logiciels : QGIS et JOSM.

Pour les salles :
On ouvre QGIS, on installe deux extensions :
-Freehand raster georeference
-QTiles

Une fois cela fait, on peut importer des images raster (.png) pour avoir une référence. Ceci est possible grâce à l'extension Freehand raster georeference.
Une fois que l'image est en arriere plan, il faut créer un nouveau calque raster.
Comme type de forme, c'est des multipolygone. Comme liste des champs, il faut ajouter un nouveau champs qui a pour nom "name" et de type texte(chaine de caractère).
Ensuite, il suffit de faire le dessin de chaque salle manuellement. Si l'établissement est sur plusieurs étages, il faut créer une couche raster pour chaque étage. Si on veut un fond de carte, il faut aussi faire deux autres calque :
Un pour le fond de batiment et un autre pour les murs.
Une fois cela fait, on peut exporter notre fond de carte avec QTiles. Format png et 0 d'opacité du fond. Le zoom minimum est 17 et le max est 23.

Ensuite, il faut exporter les salles au format geojson.
