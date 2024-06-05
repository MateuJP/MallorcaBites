var json_ferias;
document.addEventListener('DOMContentLoaded', function (e) {
    const url_data = '../assets/data_json.json';
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

});
/*
function parseDataJson(data) {
    const container = document.getElementById('container_team');
    container.innerHTML = ''
    data.equipo.forEach(member => {
        const memberHTML = `
            <div class="col-12 col-md-6 col-lg-3">
                <div class="card border-0 border-bottom border-primary shadow-sm overflow-hidden">
                    <div class="card-body p-0">
                        <figure class="m-0 p-0">
                            <img class="img-fluid" loading="lazy" src="${member.foto}" alt="${member.name}">
                            <figcaption class="m-0 p-4">
                                <h5 class="mb-1">${member.name}</h5>
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += memberHTML;
    });
}
*/
function parseDataJson(data) {
    const container = document.getElementById('container_team');
    container.innerHTML = '';
    data.equipo.forEach(member => {
        const memberHTML = `
            <div class="col-12 col-md-6 col-lg-3">
                <div class="flip-card" onclick="this.classList.toggle('flip')">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="card border-0 border-bottom border-primary shadow-sm overflow-hidden">
                                <div class="card-body p-0">
                                    <figure class="texto-prtada-imagen m-0 p-0">
                                        <img class="img-fluid" loading="lazy" src="${member.foto}" alt="${member.name}">
                                        <figcaption class="m-0 p-4" style="background-color:#8DA47E">
                                            <h5 class="mb-1">${member.name}</h5>
                                        </figcaption>
                                    </figure>
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="card border-0 border-bottom border-primary shadow-sm overflow-hidden">
                                <div class="card-body p-4">
                                    <p class="card-text">${member.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += memberHTML;
    });
}






