
$(document).ready(function () {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "escapeHtml" : false,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
  }
    const $selectIcon = $('#iconSelect');
    const urlBasic = "https://dev-genericdashbord-api-eydxcybhc5ebbbfq.canadacentral-01.azurewebsites.net/api/v1/api";
    const client = mqtt.connect("ws://10.149.75.48:9001");
    client.on("connect", () => {
        console.log("Connecté au broker !");
    });
    let chartInstance = null;
    let listSensors = [];
    let idSensorEdit = null;
    let idSensorDetails = null;
    let idSensorDelete = null;

    listViewSensorRequest();
    $.getJSON("static/core/js/icon-families.json", function (data) {
        $.each(data, function (name, icon) {
          $selectIcon.append(
              $('<option>', {
                value: name,
                text: icon.label,
                'data-icon': `fas fa-${name}`,
                'data-unicode': icon.unicode
              })
          );

        });

        // Initialize Select2 with icon
        $('#iconSelect').select2({
            dropdownParent: $('#addSensorModal'),
            templateResult: formatIcon,
            templateSelection: formatIcon,
            placeholder: "Choose an icon",
            allowClear: true
        });

        function formatIcon(option) {
            if (!option.id) return option.text;
            const iconClass = $(option.element).data('icon');
            return $(`<span><i class="${iconClass} me-2"></i>${option.text}</span>`);
        }
      });
    $(".cardTitle").each(function () {
        let text = $(this).text().trim();
        if (text.length > 17) {
            $(this).text(text.substring(0, 17) + '...');
        }
    });

    //Click Even

    $('#retry-button').on('click', function () {
        window.location.href = '/';
    });
    $(document).on('click', '.updateSensor', function () {
        $('#addSensorModalLabel').text("Edit sensor");
        $('#addButtonSensor .textB').text("Edit");
        let id = $(this).data('id');
        idSensorEdit = id;
        let sensor = listSensors.find(x => x.id === id)
        $("#formSensor #titleInput").val(sensor.title);
        $("#formSensor #unitInput").val(sensor.unit);
        $("#formSensor #topicInput").val(sensor.topic);
        $("#formSensor #iconSelect").val(sensor.icon).trigger('change');
        $("#formSensor #iconColor").val(sensor.color);
        $("#formSensor #descriptionTextarea").val(sensor.description);
        $('#addSensorModal').modal('show');
    });
    $(document).on('click', '.deleteSensor', function () {
        let id = $(this).data('id');
        idSensorDelete = id;
        let sensor = listSensors.find(x => x.id === id)
        $("#deleteSensorModal #titleSensorDelete").text(sensor.title);
        $('#deleteSensorModal').modal('show');
    });
    $(document).on('click', '.detailSensor', function () {
        idSensorDetails = $(this).data('id');
        let titleSensorDetail = $("#titleSensorDetail");
        let iconSensorDetail = $("#iconSensorDetail");
        let sensor = listSensors.find(x => x.id === idSensorDetails)
        client.on('message', (topic, message) => {
            if (sensor.topic == topic){
                $("#valueSensorDetail").text(message);
            }
        });
        titleSensorDetail.text(sensor.title);
        titleSensorDetail.prop('title', sensor.title);
        iconSensorDetail.prop('class', `fa-solid fa-${sensor.icon} fa-3x mb-3`);
        iconSensorDetail.prop('style', `color: ${sensor.color}`);
        $("#topicSensorDetail").text(sensor.topic);
        $("#descriptionSensorDetail").text(sensor.description);
        $("#unitSensorDetail").text(sensor.unit)
        $('#detailSensorModal').modal('show');
    });
    $('#addButtonModalSensor').click(function(){
        $('#addSensorModalLabel').text("Adding a sensor");
        $('#addButtonSensor .textB').text("Add");
        $('#addSensorModal').modal('show');
    });
    $('#addButtonSensor').click(function(){
        let url;
        let message;
        let method;
        let formData = {};

        $('#formSensor').find('input, textarea, select').each(function() {
            const $field = $(this);
            const name = $field.attr('name');

            if (!validateField($field)) {
                isValid = false;
            } else {
                $('#addButtonSensor .spinner-border').removeClass('visually-hidden');
                $('#addButtonSensor').attr('data-disabled', 'true');
                formData[name] = $field.val();
            }
        });
        if (idSensorEdit){
            url = urlBasic+`/sensors/${idSensorEdit}/`;
            method = `PUT`;
            message = `Sensor successfully modified`;
        }else{
            url = urlBasic+'/sensors/';
            message = `Sensor successfully added`;
            method = `POST`;
        }
        $.ajax({
            url: url,
            type: method,
            data: JSON.stringify(formData),
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                toastr.success(message)
                $('#addSensorModal').modal('hide');
            },
            error: function(xhr, status, error) {
                const message = xhr.statusText || 'Erreur inconnue';
                const details = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Aucun détail fourni.';
                displayError(message);
                toastr.error(
                    `<strong>Une erreur est survenue</strong><br>
                    <b>Statut:</b> ${status || 'Inconnu'}<br>
                    <b>Message:</b> ${message}<br>
                    <b>Détails:</b> ${details}`
                );
            }
        }).always(function() {
            $('#addButtonSensor .spinner-border').addClass('visually-hidden');
            $('#addButtonSensor').removeAttr('data-disabled');
            $('#addSensorModal').modal('hide');
            listViewSensorRequest();
        });
    });

    $('#searchDataGraphSensor').click(function(){
        $("#detailSensorModal #myChart").addClass("d-none");
        $("#detailSensorModal #loaderChart").removeClass("d-none");
        getChartDataBySensor(idSensorDetails);
    });
    $('#deleteButtonSensor').click(function(){
        $('#deleteButtonSensor .spinner-border').removeClass('visually-hidden');
        $('#deleteButtonSensor').attr('data-disabled', 'true');

        $.ajax({
            url: urlBasic+`/sensors/${idSensorDelete}/`,
            type: `DELETE`,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                toastr.success(`Sensor successfully removed`)
                $('#deleteSensorModal').modal('hide');
                $('#deleteSensorModal').modal('hide');
                listViewSensorRequest();
            },
            error: function(xhr, status, error) {
                const message = xhr.statusText || 'Erreur inconnue';
                const details = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Aucun détail fourni.';
                displayError(message);
                toastr.error(
                    `<strong>Une erreur est survenue</strong><br>
                    <b>Statut:</b> ${status || 'Inconnu'}<br>
                    <b>Message:</b> ${message}<br>
                    <b>Détails:</b> ${details}`
                );
            }
        }).always(function() {
            $('#deleteButtonSensor .spinner-border').addClass('visually-hidden');
            $('#deleteButtonSensor').removeAttr('data-disabled');
        });
    });

    //Even Modal
    $('#addSensorModal').on('hidden.bs.modal', function () {
        idSensorEdit = null;
        $selectIcon.val(null).trigger('change');
        $('#formSensor')[0].reset();
    });
    $('#deleteSensorModal').on('hidden.bs.modal', function () {
        idSensorDelete = null;
    });
    $('#detailSensorModal').on('hidden.bs.modal', function () {
        $("#detailSensorModal #loaderChart").removeClass("d-none");
        $("#detailSensorModal #myChart").addClass("d-none");
        idSensorDetails = null;
    });
    $('#formSensor').on('input change', 'input, textarea, select', function () {
        validateField($(this));
    });
    $('#detailSensorModal').on('shown.bs.modal', function () {
        getChartDataBySensor(idSensorDetails);
    });

    $('#searchInput').on('keydown', function(e) {
        if (e.key === "Enter") {
            if ($(this).val().trim() !== '') {
                searchSensor($(this).val());
            }else{
                listViewSensorRequest();
            }
        }
    });
    $('#searchButtonSensor').click(function(){
            if ($('#searchInput').val().trim() !== '') {
                searchSensor($('#searchInput').val());
            }else{
                listViewSensorRequest();
            }
    });

    //Functions
    function getChartDataBySensor(idSensor) {
        let sensor = listSensors.find((x) => x.id == idSensor)
        let endDatetime, endDatetimeISO, startDatetime, startDatetimeISO
        if ($('#detailSensorModal #startDatetime').val() && $('#detailSensorModal #endDatetime').val()) {
            endDatetime = new Date($('#detailSensorModal #endDatetime').val());
            startDatetime = new Date($('#detailSensorModal #startDatetime').val());
        }else{
            endDatetime = new Date();
            startDatetime = new Date();
            startDatetime.setDate(endDatetime.getDate() - 1);
            $('#detailSensorModal #startDatetime').val(toDatetimeLocalString(startDatetime));
            $('#detailSensorModal #endDatetime').val(toDatetimeLocalString(endDatetime));
        }
        endDatetimeISO = endDatetime.toISOString();
        startDatetimeISO = startDatetime.toISOString();
        $.ajax({
            url: urlBasic+'/sensor-data/search/by_date',
            type: 'POST',
            data: JSON.stringify({
                "sensor_id": sensor.id,
                "start_date": startDatetimeISO,
                "end_date": endDatetimeISO
            }),
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                const formattedDates = response.map(item => formatDate(item.created_at));
                const valuesData = response.map(item => item.value);
                const ctx = document.getElementById('myChart').getContext('2d');

                // Destroy the last chart
                if (chartInstance !== null) {
                    chartInstance.destroy();
                }

                // new chart
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: formattedDates,
                        datasets: [{
                            label: 'Valeurs temporelles',
                            data: valuesData,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    }
                });
                $("#detailSensorModal #myChart").removeClass("d-none");
            },
            error: function(xhr, status, error) {
                const message = xhr.statusText || 'Erreur inconnue';
                const details = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Aucun détail fourni.';
                displayError(message);
                toastr.error(
                    `<strong>Une erreur est survenue</strong><br>
                    <b>Statut:</b> ${status || 'Inconnu'}<br>
                    <b>Message:</b> ${message}<br>
                    <b>Détails:</b> ${details}`
                );
            }
        }).always(function() {
            $("#detailSensorModal #loaderChart").addClass("d-none");
        });
    }
    function getCookie(name) { //Function for getting CSRF token
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function showError($field, message) {
        $field.addClass('is-invalid'); // Bootstrap class for error
        let $feedback = $field.siblings('.invalid-feedback');

        if ($feedback.length === 0) {
            $feedback = $('<div class="invalid-feedback"></div>').insertAfter($field);
        }

        $feedback.text(message).show();
    }

    function clearError($field) {
        $field.removeClass('is-invalid');
        $field.siblings('.invalid-feedback').text('').hide();
    }

    function validateField($field) {
        const value = $field.val();
        if (!value || value.trim() === '') {
            showError($field, 'Ce champ est requis.');
            return false;
        } else {
            clearError($field);
            return true;
        }
    }

    function listViewSensorRequest() {
        displaySkeleton();
        $.ajax({
            url: urlBasic+'/sensors/',
            type: 'GET',
            success: function(response) {
                $('#sensorList').empty();
                if (response.length == 0){
                    $('#sensorList').html(`
                        <div class="d-flex flex-column justify-content-center align-items-center text-center py-5">
                          <i class="bi bi-database-x text-secondary" style="font-size: 4rem;"></i>
                          <h4 class="mt-3 text-muted">No sensor found</h4>
                          <p class="text-muted">You have not yet added any sensors to your dashboard.</p>
                        </div>
                    `);
                }else{
                     $.each(response, function(index, sensor) {
                        listSensors = response;
                        client.subscribe(sensor.topic, (err) => {
                              if (err) {
                                  // console.error(`Erreur de souscription au topic ${sensor.topic}`, err);
                              } else {
                                  // console.log(`Souscrit au topic : ${sensor.topic}`);
                              }
                          });
                        sensorAppendItem(sensor);
                     });

                     client.on("message", function (topic, message) {
                          const payload = message.toString();
                          const safeId = topic.replace(/\//g, "_");
                          const $elt = $(`#value_${safeId}`);
                          const sensor = listSensors.find((x, index) => x.topic ==  topic)
                          let body = {
                              "sensor_id": sensor.id,
                              "title": sensor.title,
                              "value": payload
                            }
                          if ($elt.length) {
                            $elt.text(`${payload}`);
                            saveDataSensor(body)
                          } else {
                            console.log(`Aucun élément trouvé pour ${topic}`);
                          }
                     });

                     client.on("error", function (err) {
                          console.error("Erreur MQTT : ", err);
                          toastr.error(
                                `<strong>Impossible de se connecter au broker MQTT.</strong><br>
                                Vérifiez que Mosquitto est démarré avec WebSockets sur le port 9001.`
                          );
                     });
                }
            },
            error: function(xhr, status, error) {
                const message = xhr.statusText || 'Erreur inconnue';
                const details = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Aucun détail fourni.';
                displayError(message);
                toastr.error(
                    `<strong>Une erreur est survenue</strong><br>
                    <b>Statut:</b> ${status || 'Inconnu'}<br>
                    <b>Message:</b> ${message}<br>
                    <b>Détails:</b> ${details}`
                );
            }
        }).always(function() {

        });
    }

    function displaySkeleton() {
        $('#sensorList').empty();
        const $erreur = $('#error-message');
        if (!$erreur.hasClass('d-none')) {
            $erreur.fadeOut(300, function () {
              $erreur.addClass('d-none').show();
            });
        }
        for (i=0; i<8; i++){
            $('#sensorList').append(`
                <div class="col-lg-3 col-md-4 col-sm-6">
                  <div class="card" style="width: 100%; max-width: 500px;">
                      <div class="card-body placeholder-glow text-center">
                        <div class="align-items-center mb-3 text-center">
                          <span class="placeholder rounded-0 me-3" style="width: 50px; height: 50px;"></span>
                        </div>
                        <span class="placeholder col-12 mb-2"></span>
                        <span class="placeholder col-10 mb-2"></span>
                        <span class="placeholder col-12 mb-2"></span>
                      </div>
                  </div>
                </div>
            `);
        }

    }

    function searchSensor(searchTitle) {
        displaySkeleton();
        $.ajax({
            url: urlBasic+`/sensors/search/?query=${searchTitle}`,
            type: `GET`,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                $('#sensorList').empty();
                if (response.length == 0){
                    $('#sensorList').html(`
                        <div class="d-flex flex-column justify-content-center align-items-center text-center py-5">
                          <i class="bi bi-database-x text-secondary" style="font-size: 4rem;"></i>
                          <h4 class="mt-3 text-muted">No sensor found</h4>
                          <p class="text-muted">No sensors matched your search.</p>
                        </div>
                    `);
                }else{
                    $.each(response, function(index, sensor) {
                        listSensors = response;
                        sensorAppendItem(sensor);
                    });
                }
            },
            error: function(xhr, status, error) {
                const message = xhr.statusText || 'Erreur inconnue';
                const details = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Aucun détail fourni.';
                displayError(message);
                toastr.error(
                    `<strong>Une erreur est survenue</strong><br>
                    <b>Statut:</b> ${status || 'Inconnu'}<br>
                    <b>Message:</b> ${message}<br>
                    <b>Détails:</b> ${details}`
                );
            }
        }).always(function() {

        });
    }

    function sensorAppendItem(sensor) {
        const safeId = sensor.topic.replace(/\//g, "_");
            $('#sensorList').append(`
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="card shadow mb-3 animate__bounceIn shadow rounded text-center" >
                        <div class="card-body">
                            <div class="d-flex">
                                <div class="dropdown ms-auto">
                                <i class="fas fa-ellipsis-vertical cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                <ul class="dropdown-menu" id="sensor-${ sensor.id }" data-title="${ sensor.title }"
                                    data-topic="${ sensor.topic }"
                                    data-description="${ sensor.description }"
                                    data-icon="${ sensor.icon }"
                                    data-iconcolor="${ sensor.color }">
                                  <li>
                                    <span class="dropdown-item cursor-pointer updateSensor" data-id="${ sensor.id }">
                                      <i class="fas fa-pen-to-square mx-2 text-success"></i> Update
                                    </span>
                                  </li>
                                  <li>
                                    <span class="dropdown-item cursor-pointer deleteSensor" data-id="${ sensor.id }">
                                        <i class="fas fa-trash-can mx-2 text-danger"></i> Delete
                                    </span>
                                  </li>
                                  <li>
                                    <span class="dropdown-item cursor-pointer detailSensor" data-id="${ sensor.id }">
                                      <i class="fas fa-circle-info mx-2 text-primary"></i> Details
                                    </span>
                                  </li>
                                </ul>
                            </div>
                            </div>
                            <i class="fa-solid fa-${ sensor.icon } fa-3x mb-3" style="color: ${ sensor.color }"></i>
                            <h5 class="card-title cardTitle" title="${ sensor.title }">${ sensor.title }</h5>
                            <span class="card-text display-6" id="value_${safeId}">... </span> <span class="display-6">${ sensor.unit || '' }</span>
                        </div>
                    </div>
                </div>
            `);
    }

    function displayError(message = null) {
        const texteError = message ?? "An error has occurred.";
        $('#error-message .error-text').html(
            texteError + "<br>Please try again later.<br>If the problem persists, contact the administrator."
        );
        $('#error-message').removeClass('d-none').fadeIn();
    }

    function formatDate(isoString) {
      const date = new Date(isoString);
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = String(date.getUTCFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    }

    function toDatetimeLocalString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // mois = 0-11
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function saveDataSensor(body) {
        $.ajax({
            url: `${urlBasic}/sensor-data/`,
            type: "POST",
            data: JSON.stringify(body),
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                // console.log(response)
            },
            error: function(xhr, status, error) {
                const message = xhr.statusText || 'Erreur inconnue';
                const details = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Aucun détail fourni.';
                toastr.error(
                    `<strong>Une erreur est survenue</strong><br>
                    <b>Statut:</b> ${status || 'Inconnu'}<br>
                    <b>Message:</b> ${message}<br>
                    <b>Détails:</b> ${details}`
                );
            }
        }).always(function() {});
    }
});
