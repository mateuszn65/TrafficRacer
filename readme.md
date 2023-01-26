# Traffic Racer #

### Opis ### 

Projekt na wstęp do programowania grafiki komputerowej 2022/23. 

Prosta gra wyścigowa 3d inspirowana grą mobilną [Traffic Racer](https://play.google.com/store/apps/details?id=com.skgames.trafficracer&hl=pl). Jedź jak najdalej po nieskończonej drodze, unikając innych samochodów i zdobywając punkty za przebyty dystans, prędkość i bliskie zderzenia. Steruj samochodem za pomocą klawiszy strzałek lub WASD. Gra kończy się, gdy zderzysz się z innym samochodem.

### Uruchomienie ###
Aby uruchomić grę, otwórz plik ***index.html*** za pomocą live servera. Jeśli plik ***bundle.js*** znajduje się w folderze dist, powinno to działać bez problemu.

Jeśli plik bundle.js nie jest obecny, wykonaj następujące polecenia, aby zainstalować zależności i uruchomić serwer developerski:

```
npm install
npm run start
```

### Struktura projektu ### 
Projekt został stworzony całkowicie za pomocą three.js i nie używa biblioteki fizyki.
1. ***dist***
    - ***bundle.js*** generowany przez webpack

    - ***index.html*** plik renderowany przez serwer
2. ***src***
    - ***Car.js*** sterowanie samochodem wzorowane na [przykładzie](https://alteredqualia.com/three/examples/webgl_cars.html) użycia three.js

    - ***CarControls.js*** mapuje input na odpowiednie ruchy, które następnie odczytuje klasa Car.js

    - ***Muscle.js*** rozszerzenie klasy Car.js, które mapuje mesh dla kół i karoserji odpowiednio dla ładowanego modelu

    - ***index.js*** główny plik, który tworzy i renderuje scene, wylicza punkty, aktualizuje drogę dając wrażenie nieskończonej(to droga się porusza, nie samochód) oraz wykrywa kolizje za pomocą bounding boxów


3. ***static*** zawiera modele samochodów w formacie fbx oraz texture drogi