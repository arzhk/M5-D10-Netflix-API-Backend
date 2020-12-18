# M5-D10 Netflix-Backend API

# ROUTES

### /movies

```sh
GET - /movies, Returns Array of all movies
```

```sh
GET - /movies/:imdbID, Returns the movie with the matching imdbID from the movies array
```

```sh
GET - /movies/test/:imdbID, Returns the movie with the matching imdbID from the OMDB API
```

```sh
POST - /movies/new/:imdbID, Fetches data from the OMDB API based on the imdbID and stores the required data in the movies array
```
