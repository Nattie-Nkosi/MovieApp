const autocompleteConfig = {
  renderOption: (movie) => {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
        <img src="${imgSrc}" />
        ${movie.Title} (${movie.Year})
    `;
  },
  inputValue: (movie) => {
    return movie.Title;
  },
  async fetchData(seachTerm) {
    const response = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: "c326d45c",
        s: seachTerm,
      },
    });

    if (response.data.Error) {
      return [];
    }

    return response.data.Search;
  },
};

createAutoComplete({
  // The dots means take all the properties of autocompleteConfig to this function
  ...autocompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect: (movie) => {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summery"), "left");
  },
});
createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect: (movie) => {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summery"), "right");
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summeryElement, side) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "c326d45c",
      i: movie.imdbID,
    },
  });

  summeryElement.innerHTML = movieTemplate(response.data);

  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if (leftMovie && rightMovie) {
    runComperison();
  }
};

const runComperison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summery .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summery .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = parseInt(leftStat.dataset.value);
    const rightSideValue = parseInt(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imbdRating = parseFloat(movieDetail.imdbRating);
  const imbdVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);

    if (isNaN(value)) {
      return;
    } else {
      return prev + value;
    }
  }, 0);
  return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}" />
                </p>
            </figure>

            <div class="media-content">
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        
        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="title">${movieDetail.BoxOffice}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value=${metascore} class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imbdRating} class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imbdVotes} class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `;
};
