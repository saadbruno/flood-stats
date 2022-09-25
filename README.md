# Flood Stats

![image](https://user-images.githubusercontent.com/23201434/192146169-de1bb71b-529d-4849-bf47-4d22a982a1d3.png)

A way to track your Flood upload history form day to day.

## Usage

### With Docker:
- Create a `config.json` file with the following info, adapting each line to fit your local setup
```
{
    "flood-url": "http://localhost:3001/api",
    "flood-username": "Your Flood Username",
    "flood-password": "Your Flood Password"
}
```
- Create a `docker-compose.yml` file:
```
version: '3.5'
services:
  flood-stats:
    image: saadbruno/flood-stats:latest
    volumes:
      - ./config.json:/usr/src/app/config.json:ro
      - ./torrent-data.sqlite:/usr/src/app/torrent-data.sqlite
    ports:
      - 3000:3000
```
- run `docker-compose up -d`

### Without Docker:
- Clone this repo
- Copy `config.json.template` to `config.json` and adapt it to your local setup
- run `node .`

