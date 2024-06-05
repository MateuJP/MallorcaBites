var json_ferias;
var active_ferias;
document.addEventListener('DOMContentLoaded', function (e) {
    const url = './assets/Fires.json'
    const url_data = './assets/data_json.json';
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            parseJSON((data));
        })
        .catch(error => {
            console.error('Error al cargar el JSON:', error);
        });
    fetch(url_data)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            parseDataJson((data));
        })
        .catch(error => {
            console.error('Error al cargar el JSON:', error);
        });
    buscador();

    document.getElementById('filtros_ordenación').addEventListener('change', function () {
        ordenarFerias(this.value);
    });


});

function parseDataJson(data) {
    const selectMunicipio = document.getElementById('municipio');
    const selectMes = document.getElementById('mes')
    const selectFiltro = document.getElementById('filtros_ordenación');
    data.municipios.forEach(item => {
        selectMunicipio.appendChild(createOption(item, item));
    });
    data.meses.forEach(item => {
        selectMes.appendChild(createOption(item, item));
    });
    data.filtros.forEach(item => {
        selectFiltro.appendChild(createOption(item, `filtro_${item}`));
    })
}

function parseJSON(data) {
    const events = data.itemListElement;
    json_ferias = events;
    active_ferias = json_ferias;
    const containerFerias = document.getElementById('feriaContainer');
    let jsonLDs = [];
    events.forEach((event, index) => {
        let s = generateJsonLD(event);
        jsonLDs.push(s);
        const card = buildCard(event.image, event.name, event.startDate, event.endDate, event['@identifier']);
        containerFerias.appendChild(card);
    });
    document.getElementById('WebSemantica_ferias').innerHTML += JSON.stringify(jsonLDs)
}
function generateJsonLD(event) {
    return {
        "@context": "http://schema.org",
        "@type": "FoodEvent",
        "name": event.name,
        "startDate": event.startDate,
        "endDate": event.endDate,
        "location": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": event.location[0].address.addressLocality,
                "addressRegion": event.location[0].addressRegion,
                "postalCode": event.location[0].address.postalCode,
                "streetAddress": event.location[0].address.streetAddress
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": event.location[1].geo.latitude,
                "longitude": event.location[1].geo.longitude
            }
        },
        "image": event.image,
        "description": event.description,
        "isAccessibleForFree": event.isAccessibleForFree
    };
}

function buildCard(img_url, title, fechaInicio, fechaFin, index) {
    const container = createElement('div', 'col mb-4');
    const cardContainer = createElement('div', 'card h-auto card-evento');
    const overlay = createElement('div', 'view overlay');

    const imgCard = createImage(img_url, title, 'card-img-top imagen-carta-inicio');
    overlay.appendChild(imgCard);

    const cardBody = createElement('div', 'card-body text-center');
    const card_title = createElement('h4', 'card-title', title);
    const card_date_start = createParagraph('card-text', `Fecha de inicio: ${formatData(fechaInicio)}`);
    const card_date_end = createParagraph('card-text', `Fecha de fin: ${formatData(fechaFin)}`);
    const link = createLink(`fira.html?id=${index}`, 'btn btn-light-blue btn-md', title);
    cardBody.appendChild(card_title);
    cardBody.appendChild(card_date_start);
    cardBody.appendChild(card_date_end);
    cardBody.appendChild(link);

    cardContainer.appendChild(overlay);
    cardContainer.appendChild(cardBody);
    container.appendChild(cardContainer);

    return container;
}


function ordenarFerias(criterio) {
    active_ferias.sort((a, b) => {
        switch (criterio) {
            case 'filtro_Mes':
                return compareByMonth(a, b);
            case 'filtro_Nombre':
                return a.name.localeCompare(b.name);
            case 'filtro_Valoración':
                return compareByRating(a, b);
            default:
                return 0;
        }
    });
    mostrarResultados(active_ferias);
}
function compareByMonth(a, b) {
    const monthA = getMonthFromDate(a.startDate);
    const monthB = getMonthFromDate(b.startDate);
    return monthA - monthB || getDateDay(a.startDate) - getDateDay(b.startDate);
}

function compareByRating(a, b) {
    return caluclate_average_rating(b.aggregateRating) - caluclate_average_rating(a.aggregateRating);
}
function caluclate_average_rating(aggregateRatings) {
    const totalSum = aggregateRatings.reduce((sum, rating) => sum + parseInt(rating.reviewCount), 0) || 1;
    const weightedSum = aggregateRatings.reduce((sum, rating) => sum + (parseInt(rating.ratingValue) * parseInt(rating.reviewCount)), 0);
    return (weightedSum / totalSum).toFixed(2);
}


function buscador() {
    const boton = document.getElementById('boton_buscador_feria');
    boton.addEventListener('click', function (e) {
        e.preventDefault()
        var municipio = document.getElementById('municipio').value;
        var mes = document.getElementById('mes').value;
        var nombreFeria = document.getElementById('nombre_feria_input').value;

        buscarFeria(municipio, mes, nombreFeria);

    })
}
function buscarFeria(municipio, mes, nombreFeria) {
    if (nombreFeria) {
        buscarFeriaPorNombre(nombreFeria)
    } else if (municipio !== 'Municipio' || nombreFeria !== 'Mes') {
        buscarFeriaPorMunicipioOMes(municipio, mes)
    }
}

function buscarFeriaPorNombre(nombreFeria) {
    var resultados = json_ferias.filter(function (feria) {
        return feria.name.toLowerCase().includes(nombreFeria.toLowerCase());
    });

    if (resultados.length > 0) {
        window.location.href = `fira.html?id=${resultados[0]['@identifier']}`
    } else {
        showAlert("No Encontrado", "error", "No se ha encontrado ninguna feria  que coincida con tu búsqueda")
    }
}
function buscarFeriaPorMunicipioOMes(municipio, mes) {
    var resultados = json_ferias.filter(function (feria) {
        const place = feria.location.find(loc => loc['@type'] === 'Place');
        const fecha = new Date(feria.startDate);
        const mes_feria = fecha.toLocaleString('es-ES', { month: 'long' });
        var cumpleMunicipio = municipio !== 'Municipio' && municipio ? place.address.addressLocality.toLowerCase() === municipio.toLowerCase() : true;
        var cumpleMes = mes !== 'Mes' && mes ? mes_feria.toLowerCase() === mes.toLowerCase() : true;
        return cumpleMunicipio && cumpleMes;
    });
    mostrarResultados(resultados);

}
function mostrarResultados(ferias) {
    const containerFerias = document.getElementById('feriaContainer');
    const seccionFerias = document.getElementById('todasFerias');
    active_ferias = ferias;

    if (ferias.length === 0) {
        showAlert("No Encontrado", "error", "No se ha encontrado ninguna feria con estas características")

    } else {
        containerFerias.innerHTML = '';

        document.getElementById('WebSemantica_ferias').innerHTML = ''
        let jsonLDs = [];
        ferias.forEach((event) => {
            let s = generateJsonLD(event);
            jsonLDs.push(s);
            const card = buildCard(event.image, event.name, event.startDate, event.endDate, event['@identifier']);
            containerFerias.appendChild(card);
        });
        document.getElementById('WebSemantica_ferias').innerHTML += JSON.stringify(jsonLDs)
        seccionFerias.scrollIntoView({ behavior: 'smooth', block: 'start' });

    }
}

// FUNCIONES AUXILIARES
function createOption(text, value = text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
}


function formatData(date) {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
}

function getMonthFromDate(dateString) {
    const parts = dateString.split('-');
    return parseInt(parts[1], 10);
}

function getDateDay(dateString) {
    const parts = dateString.split('-');
    return parseInt(parts[0], 10);
}

function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}

function createImage(src, alt, className) {
    const img = createElement('img', className);
    img.src = src;
    img.alt = alt;
    return img;
}

function createParagraph(className, textContent) {
    return createElement('p', className, textContent);
}

function createLink(href, className, textContent) {
    const link = createElement('a', className, textContent);
    link.href = href;
    link.setAttribute('aria-label', `Ver más información sobre ${textContent}`);
    link.title = `Información sobre ${textContent}`
    return link;
}

function showAlert(title, icon, text) {
    Swal.fire({
        title: title,
        icon: icon,
        text: text
    });

}