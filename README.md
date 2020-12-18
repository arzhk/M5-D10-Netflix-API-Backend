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

```sh
GET - /movies/reviews/:imdbID, Returns all reviews for the specified movie based on imdbID
```

```sh
GET - /movies/reviews/:imdbID?review=, Returns specific review from a movie based on the review query id
```

```sh
POST - /movies/reviews/:imdbID, Adds new review to the movie specified by the imdbID
```

```sh
DELETE - /movies/reviews/:imdbID?review=, Deletes specific review for movie specified by the imdbID and the review based on the review query id
```

### Services Main

##### /services/

```sh
GET - /services/imdbsearch?id={imdbID}&year="optional"&type="optional", Returns the search data from the OMDB API
```

##### Can use ?id= or ?title= interchangeably

| Query                                    | Return                                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ?id=                                     | Returns search information from the OMDB API based on the imdbID provided                                                                           |
| ?title=                                  | Returns an array containing search information from the OMDB API based on the title provided                                                        |
| Optional filters(for title search only): |                                                                                                                                                     |
| &year=                                   | Returns an array containing the search information from the OMDB API based on the title provided and filtered by the year provided.                 |
| &type=                                   | Returns an array containing the search information from the OMDB API based on the title provided and filtered by the type provided.                 |
| &year= &type=                            | Returns an array containing the search information from the OMDB API based on the title provided and > filtered by both the year and type provided. |

```sh
GET - /services/sort?by=, Returns a sorted version of the movies array based on the query that is passed.
```

| Query      | Return                                                   |
| ---------- | -------------------------------------------------------- |
| ?by=rating | Sorts the movie array by the average rating of the movie |
| ?by=title  | Sorts the movie array by the title of the movie          |
| ?by=genre  | Sorts the movie array by the genre of the movie          |
| ?by=year   | Sorts the movie array by the year of the movie           |

```sh
GET - /services/catalogue/export?title=, Exports a PDF containing a catalogue of movies based on the title query from the OMDB API.
```

```sh
GET - /services/email/catalogue?title=title&email=recipient, Sends a copy of a catalogue based on the title query from the OMDB API to the email address from the email query.
```

```sh
GET - /services/catalogue?title=title, Returns catalogue of search data based on the title query
```
