let id;
let aggregateRating;
let map;
let markers = [];
let currentDistance = 20;
let my_lat;
let my_lon;
function fetchData() {
    const url = './assets/Fires.json'
    const distanceRange = document.getElementById('distanceRange');
    distanceRange.addEventListener('input', updateDistance);
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            parseJSON((data));
            updateVotation();
        })
        .catch(error => {
            console.error('Error al cargar el JSON:', error);
        });
}

function parseJSON(data) {
    const events = data.itemListElement
    const queryParams = new URLSearchParams(window.location.search);
    const idFeria = parseInt(queryParams.get('id'));
    id = idFeria;
    const feria = events.find(evento => evento['@identifier'] === idFeria);
    createJsonLD(feria)
    navBar(feria.name);
    titleAndDescription(feria.name, feria.description);
    icons(feria);
    const geoInfo = feria.location.find(loc => loc.geo != undefined).geo;
    if (geoInfo) {
        my_lat = geoInfo.latitude;
        my_lon = geoInfo.longitude;
        initMap(parseFloat(my_lat), parseFloat(my_lon))
        iniciarMapa()
    }
    let is_first_recipe = true;
    feria.subjectOf.forEach(subject => {
        if (subject['@type'] === 'CreativeWork') {
            subject.video.forEach(video => {
                makevideo(video.contentUrl, video.encoding)

            })
        } else if (subject['@type'] === 'Recipe') {
            appendRecipe(subject.image, subject.url, subject.name, is_first_recipe);
            is_first_recipe = false;
        }
    });
    aggregateRating = feria.aggregateRating;
    initRating(id, aggregateRating)
}

function createJsonLD(data) {
    const { averageRating, totalSum } = calculateAverageRating(data.aggregateRating);

    let jsonLD = {
        "@context": "http://schema.org",
        "@type": "FoodEvent",
        "name": data.name,
        "description": data.description,
        "isAccessibleForFree": data.isAccessibleForFree,
        "location": data.location.map(loc => {
            if (loc.address) {
                return {
                    "@type": "Place",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": loc.address.addressLocality,
                        "addressRegion": loc.address.addressRegion,
                        "postalCode": loc.address.postalCode,
                        "streetAddress": loc.address.streetAddress
                    }
                };
            } else if (loc.geo) {
                return {
                    "@type": "Place",
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": loc.geo.latitude,
                        "longitude": loc.geo.longitude
                    }
                };
            }
        }),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": averageRating,
            "bestRating": "5",
            "ratingCount": totalSum,
        },
        "startDate": data.startDate,
        "endDate": data.endDate,
        "image": data.image,
        "subjectOf": data.subjectOf.map(item => {
            if (item["@type"] === "Recipe") {
                return {
                    "@type": "Recipe",
                    "name": item.name,
                    "image": item.image,
                    "url": item.url
                };
            }
            /* 
            else if (item["@type"] === "CreativeWork" && item.video) {
                return {
                    "@type": "CreativeWork",
                    "video": item.video.map(video => ({
                        "@type": "VideoObject",
                        "encoding": video.encoding,
                        "name": video.name,
                        "contentUrl": video.contentUrl,
                        "thumbnailUrl": "null",
                        "uploadDate": "null"

                    }))
                };
            }
            */
        }),
        "audience": data.audience.map(aud => ({
            "@type": "PeopleAudience",
            "audienceType": aud.audienceType
        })),
        "additionalProperty": data.additionalProperty.map(prop => ({
            "@type": "PropertyValue",
            "name": prop.name,
            "value": prop.value
        }))
    };
    document.getElementById('WebSemantica').innerHTML += JSON.stringify(jsonLD)

}

function navBar(name) {
    const ul_ferias = document.getElementById('ul_ferias_nav');

    const li_feria = createElement('li');
    const a_feria = createElement('a', 'nav-link scrollto active', name);
    a_feria.href = '#info';
    li_feria.appendChild(a_feria);

    const li_contact = createElement('li');
    const a_contacto = createElement('a', 'nav-link scrollto', 'Contacto');
    a_contacto.href = '#contacto';
    li_contact.appendChild(a_contacto);

    ul_ferias.appendChild(li_feria);
    ul_ferias.appendChild(li_contact);
}

function titleAndDescription(name, description) {
    const tituloPagina = document.getElementById('titulo_pagina_feria');
    tituloPagina.innerHTML = name;
    document.getElementById('description_pagina_feria').setAttribute('content', description);

    const container = document.querySelector('.contenedor-descripcion-principal');

    const div = createElement('div');
    const div_description = createElement('div', 'feria-description-container');
    const div_speech = createElement('div', 'feria-speach-container');
    const icon = createElement('i', 'fas fa-volume-down');

    div_speech.appendChild(icon);

    const h2 = createElement('h2', 'titulo_feria', name);
    const p = createElement('p', 'description_feria', description);

    div_description.appendChild(p);
    div_description.appendChild(div_speech);

    div.appendChild(h2);
    div.appendChild(div_description);
    container.appendChild(div);

    botonspeech(icon, description);
}


function icons(event) {
    const div = document.querySelector('.icons-info-container');

    const ticketIcon = event.isAccessibleForFree ?
        createIconWithText('fa-ticket-alt', 'Entrada gratuita') :
        createIconWithText('fa-ticket-alt', `${event.offers.price} €`);
    console.log(ticketIcon)
    div.appendChild(ticketIcon);

    event.audience.forEach(audience => {
        if (audience.audienceType === 'Familias con niños') {
            const childIcon = createIconWithText('fa-child', 'Ideal para niños');
            div.appendChild(childIcon);
        }
    });

    if (event.additionalProperty) {
        event.additionalProperty.forEach(info => {
            if (info.name === 'Estacionamiento') {
                const parkingIcon = createIconWithText('fa-car', 'Aparcamiento disponible');
                div.appendChild(parkingIcon);
            }
        });
    }
}


function createIconWithText(iconName, textContent) {
    const divIcon = createElement('div', 'icon-with-text');
    const icon = createElement('i', `fas ${iconName}`);
    const text = createElement('p', null, textContent);

    divIcon.appendChild(icon);
    divIcon.appendChild(text);

    return divIcon;
}

function initMap(lat, lng) {

    var ubicacion = { lat: lat, lng: lng };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: ubicacion
    });
    var marker = new google.maps.Marker({
        position: ubicacion,
        map: map
    });
}

function makevideo(src, encoding) {
    const video = document.getElementById('myVideo');
    const src_video = document.createElement('source');
    src_video.src = src;
    src_video.type = encoding;
    video.appendChild(src_video);

}
function appendRecipe(img_src, url, name, isFirst) {
    const div_container = document.querySelector('.carousel-inner');
    const carouselItem = createElement('div', isFirst ? 'carousel-item active' : 'carousel-item');
    const imgContainer = createElement('div', 'img_recipe');

    const img = createImage(img_src, name, "d-block w-100");
    imgContainer.appendChild(img);

    const overlay = createElement('div', 'overlay_img_recipe');
    imgContainer.appendChild(overlay);
    carouselItem.appendChild(imgContainer);

    const caption = createElement('div', 'carousel-caption');
    const h5 = createElement('h5', 'recipe-title', name);
    const link = createLink(url, "btn btn-primary recipe-btn", 'Ver Receta');

    caption.appendChild(h5);
    caption.appendChild(link);
    carouselItem.appendChild(caption);

    div_container.appendChild(carouselItem);
}


function botonspeech(icon, desc) {
    const synth = window.speechSynthesis;
    let utterance = new SpeechSynthesisUtterance(desc);

    const voices = synth.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
        utterance.voice = spanishVoice;
    } else {
        console.log('No se encontró una voz en español.');
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    icon.addEventListener('click', function () {
        if (synth.speaking) {
            icon.className = 'fas fa-volume-down';
            synth.cancel();
        } else {
            synth.speak(utterance);
            icon.className = 'fas fa-pause';

        }
    });


}

function initRating(id, aggregateRatings) {
    const container = document.getElementById('reviewContainer')
    const totalSum = aggregateRatings.reduce((sum, rating) => sum + parseInt(rating.reviewCount), 0) || 1;
    const weightedSum = aggregateRatings.reduce((sum, rating) => sum + (parseInt(rating.ratingValue) * parseInt(rating.reviewCount)), 0);
    const averageRating = (weightedSum / totalSum).toFixed(2);
    const frequency = {};
    aggregateRatings.forEach(rating => {
        const value = rating.ratingValue;
        frequency[value] = ((rating.reviewCount / totalSum) * 100).toFixed(2);
    });
    const html = `
<div class="row">
    <div class="col-md-6 text-center">
        <h1 class="rating-num">${averageRating}</h1>
        <div class="rating" data-fira-id=${id}>
            <input type="radio" id="star5" name="rating" value="5" class="rating-input"><label for="star5" class="fa fa-star"></label>
            <input type="radio" id="star4" name="rating" value="4" class="rating-input"><label for="star4" class="fa fa-star"></label>
            <input type="radio" id="star3" name="rating" value="3" class="rating-input"><label for="star3" class="fa fa-star"></label>
            <input type="radio" id="star2" name="rating" value="2" class="rating-input"><label for="star2" class="fa fa-star"></label>
            <input type="radio" id="star1" name="rating" value="1" class="rating-input"><label for="star1" class="fa fa-star"></label>
        </div>
        <div>
            <i class="fa fa-user"></i> ${totalSum} total
        </div>
    </div>
    <div class="col-md-6">
        <div class="row rating-desc">
            ${[5, 4, 3, 2, 1].map(star => `
                <div class="col-md-3 rating_value_star">
                    <span>${star}</span>
                    <i class="fa fa-star"></i>
                </div>
                <div class="col-md-9">
                    <div class="progress">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${((frequency[star] || 0))}%" aria-valuenow="${((frequency[star] || 0))}" aria-valuemin="0" aria-valuemax="100">
                            <span class="sr-only">${((frequency[star] || 0))}%</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</div>
`;
    container.innerHTML = html;


}

function updateVotation() {
    const ratingInputs = document.querySelectorAll('.rating-input');
    ratingInputs.forEach(input => {
        input.addEventListener('change', function () {
            const firaId = document.querySelector('.rating').getAttribute('data-fira-id');
            const selectedRating = this.value;
            const formData = new FormData();
            formData.append('firaId', firaId);
            formData.append('rating', selectedRating);
            fetch('update_rating.php', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        showAlert("Reseña guardada", "success", "Tu reseña ha sido guardada con éxito")
                    } else {
                        showAlert("Error al guardar", "error", "No se ha podido guardar tu reseña")
                            .then((ressult) => {
                                if (ressult.value) {
                                    initRating(id, aggregateRating)

                                }
                            })
                        console.error('HTTP Error:', response.status);
                    }
                })
                .catch(error => {
                    console.error('Error de red:', error);
                    showAlert("Error de comunicación", "error", "Hubo un problema al intentar enviar la reseña. Por favor, verifica tu conexión a internet");
                });
        });
    });
}

function iniciarMapa() {
    map = new google.maps.Map(document.getElementById('map2'), {
        zoom: 10,
        center: { lat: my_lat, lng: my_lon }
    });

    cargarEventosProximos();
    cargarEventosProximosItemList();
}
function updateDistance() {
    const range = document.getElementById('distanceRange')
    console.log(range);
    currentDistance = range.value;
    document.getElementById('distanceValue').innerText = currentDistance;
    cargarEventosProximos();
    cargarEventosProximosItemList();
}
/*
function eventosProximos(map, my_lat, my_lon) {
    fetch('https://www.mallorkcultura.com/json/museosMallorkCultura.json')
        .then(response => response.json())
        .then(data => {
            const proximos = data.servicios.filter(service => {
                const distance = calculateDistance(my_lat, my_lon, parseFloat(service.areaServed.geo.latitude), parseFloat(service.areaServed.geo.longitude));
                return distance < currentDistance;
            });

            proximos.forEach(service => {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(service.areaServed.geo.latitude), lng: parseFloat(service.areaServed.geo.longitude) },
                    map: map,
                    title: service.areaServed.name
                });

                const infowindow = new google.maps.InfoWindow({
                    content: `<h3>${service.areaServed.name}</h3><p>${service.areaServed.description}</p>` // Asume que el JSON tiene una descripción o ajusta según tu estructura
                });

                marker.addListener('click', () => {
                    infowindow.open(map, marker);
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function eventosProximosItemList(map, my_lat, my_lon) {
    fetch('https://www.descobreixteatre.com/assets/json/Teatre.json')
        .then(response => response.json())
        .then(data => {
            // Verificamos que el JSON tenga el formato esperado
            if (data['@context'] && data['@type'] === 'itemList' && Array.isArray(data.itemListElement)) {
                const proximos = data.itemListElement.filter(item => {
                    if (item['@type'] === 'MovieTheater') {
                        const distance = calculateDistance(my_lat, my_lon, parseFloat(item.geo.latitude), parseFloat(item.geo.longitude));
                        return distance < currentDistance;
                    }
                    return false;
                });

                proximos.forEach(item => {
                    const marker = new google.maps.Marker({
                        position: { lat: parseFloat(item.geo.latitude), lng: parseFloat(item.geo.longitude) },
                        map: map,
                        title: item.name
                    });

                    const infowindow = new google.maps.InfoWindow({
                        content: `<h3>${item.name}</h3><p>${item.address.streetAddress}, ${item.address.addressLocality}, ${item.address.addressRegion}, ${item.address.addressCountry}</p>`
                    });

                    marker.addListener('click', () => {
                        infowindow.open(map, marker);
                    });
                });
            } else {
                console.error('El JSON no tiene el formato esperado.');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
*/
function cargarEventosProximos() {
    fetch('https://www.mallorkcultura.com/json/museosMallorkCultura.json')
        .then(response => response.json())
        .then(data => {
            actualizarMarcadores(my_lat, my_lon, data.servicios, 'service');
        })
        .catch(error => console.error('Error fetching data:', error));
}

function cargarEventosProximosItemList() {
    fetch('https://www.descobreixteatre.com/assets/json/Teatre.json')
        .then(response => response.json())
        .then(data => {
            if (data['@context'] && data['@type'] === 'itemList' && Array.isArray(data.itemListElement)) {
                actualizarMarcadores(my_lat, my_lon, data.itemListElement, 'item');
            } else {
                console.error('El JSON no tiene el formato esperado.');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function actualizarMarcadores(my_lat, my_lon, elementos, tipo) {
    const proximos = elementos.filter(element => {
        let lat, lon;
        if (tipo === 'service') {
            lat = parseFloat(element.areaServed.geo.latitude);
            lon = parseFloat(element.areaServed.geo.longitude);
        } else {
            lat = parseFloat(element.geo.latitude);
            lon = parseFloat(element.geo.longitude);
        }
        const distance = calculateDistance(my_lat, my_lon, lat, lon);
        return distance <= currentDistance;
    });

    proximos.forEach(element => {
        let lat, lon, title, content;
        if (tipo === 'service') {
            lat = parseFloat(element.areaServed.geo.latitude);
            lon = parseFloat(element.areaServed.geo.longitude);
            title = element.areaServed.name;
            content = `<h3>${element.areaServed.name}</h3><p>${element.areaServed.description}</p>`;
        } else {
            lat = parseFloat(element.geo.latitude);
            lon = parseFloat(element.geo.longitude);
            title = element.name;
            content = `<h3>${element.name}</h3><p>${element.description}</p>`;
        }

        const marker = new google.maps.Marker({
            position: { lat: lat, lng: lon },
            map: map,
            title: title
        });

        const infowindow = new google.maps.InfoWindow({
            content: content
        });

        marker.addListener('click', () => {
            infowindow.open(map, marker);
        });

        markers.push(marker);
    });
}

function updateDistance() {
    currentDistance = document.getElementById('distanceRange').value;
    document.getElementById('distanceValue').innerText = currentDistance;
    markers.forEach(marker => marker.setMap(null))
    cargarEventosProximos();
    cargarEventosProximosItemList();
}



// FUNCIONES AUXILIARES

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en kilómetros
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

function createLink(href, className, textContent, target = "_blank") {
    const link = createElement('a', className, textContent);
    link.href = href;
    link.target = target;
    return link;
}

function showAlert(title, icon, text) {
    Swal.fire({
        title: title,
        icon: icon,
        text: text
    });

}

function calculateAverageRating(aggregateRatings) {
    const totalSum = aggregateRatings.reduce((sum, rating) => sum + parseInt(rating.reviewCount), 0) || 1;
    const weightedSum = aggregateRatings.reduce((sum, rating) => sum + (parseInt(rating.ratingValue) * parseInt(rating.reviewCount)), 0);
    const averageRating = (weightedSum / totalSum).toFixed(2);
    return { averageRating, totalSum };
}