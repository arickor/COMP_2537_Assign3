const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = [];
let selected_types = [];


const update = (currentPage, PAGE_SIZE, pokemons) => {
  let start = (currentPage - 1) * PAGE_SIZE + 1;
  let end = Math.min(currentPage * PAGE_SIZE, pokemons.length);

  $('#pokeInfo').html(`
      <p style = "color:#f5f5f5">Showing ${start} - ${end} of ${pokemons.length} Pokemon</p>
    `)
}


const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, numPages);
  startPage = Math.max(endPage - 4, 1);

  if (currentPage > 1) {
    $('#pagination').append(`
        <button class="btn btn-primary page ml-1" value="${currentPage - 1}">Prev</button>
      `)
  }

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons ${i == currentPage ? 'active-page' : ''}" value="${i}">${i}</button>
      `)
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
        <button class="btn btn-primary page ml-1" value="${currentPage + 1}">Next</button>
      `)
  }
}


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
  update(currentPage, PAGE_SIZE, pokemons);
}

const setup = async () => {

  const results = await axios.get('https://pokeapi.co/api/v2/type');
  const types = results.data.results;

  types.forEach(type => {
    $('.pokeFilter').append(`
        <div class="form-check form-check-inline">
          <input class="form-check-input typeChk" type="checkbox" typeurl="${type.url}">
          <label class="form-check-label" for="inlineCheckbox1">${type.name}</label>
        </div>
      `)
  })

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  $('body').on('click', '.typeChk', async function (e) {
    if ($(this).is(':checked')) {
      selected_types.push($(this).attr('typeurl'))
    } else {
      selected_types = selected_types.filter((type) => type !== $(this).attr('typeurl'))
    }
    console.log("selected_types: ", selected_types);

    let filtered_pokemons = [];

    for (let i = 0; i < selected_types.length; i++) {
      filtered_pokemons.push((await axios.get(selected_types[i])).data.pokemon.map((pokemon) => pokemon.pokemon));
    }

    console.log("filtered_pokemons: ", filtered_pokemons);

    if (selected_types.length != 0) {
      pokemons = filtered_pokemons.reduce((a, b) => a.filter(c => b.some(d => d.name === c.name)));
    } else {
      pokemons = response.data.results;
    }

    console.log("pokemons: ", pokemons);
    paginate(currentPage, PAGE_SIZE, pokemons)
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages);
  })

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    const types = res.data.types.map((type) => type.type.name)
    $('.modal-body').html(`
          <div style="width:200px">
          <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>

          <div>
          <h3>Stats</h3>
          <ul>
          ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
  
          </div>
          <div>
          <h3>Abilities</h3>
          <ul>
          ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
          </div>
 
          </div>
            <h3>Types</h3>
            <ul>
            ${types.map((type) => `<li>${type}</li>`).join('')}
            </ul>
        
          `)
    $('.modal-title').html(`
          <h2>${res.data.name.toUpperCase()}</h2>
          <h5>${res.data.id}</h5>
          `)
  })

  $('body').on('click', '.page', async function (e) {
    const newPage = Number(e.target.value);

    if (newPage !== currentPage) {
      currentPage = newPage;
      const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
      paginate(currentPage, PAGE_SIZE, pokemons);
      updatePaginationDiv(currentPage, numPages);
    }
  });

}
$(document).ready(setup)  