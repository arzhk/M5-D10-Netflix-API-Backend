# M5-D10 Netflix-Backend API

# ROUTES

### Movies Main

##### /movies/

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
POST - /movies/new/:imdbID, Adds new movie to the movies array using data from the OMDB API
```

```sh
PUT - /movies/update/:imdbID, Updates data for the movie that matches the provided imdbID
```

```sh
DELETE - /movies/delete/:imdbID, Deletes movie from the movie array based on the provided imdbID
```

##### /movies/reviews
