var categories = [];
var messages = [];

// Получение категорий
function fetchCategoriesFromServer() {
    $.ajax({
        url: "/categories",
        method: "GET",
        success: function(data) {
            if (Array.isArray(data) && data.length > 0) {
                categories = data;
                fillSelects();
            }
        },
        error: function() {
            alert("Ошибка получения категорий с сервера");
        }
    });
}

// Получение всех заметок 
function fetchMessagesFromServer() {
    $.ajax({
        url: "/messages",
        method: "GET",
        success: function(data) {
            if (Array.isArray(data)) {
                messages = data;
                renderMessages();
            }
        },
        error: function() {
            alert("Ошибка получения сообщений с сервера");
        }
    });
}

// Отправка формы
function sendForm() {
    var data = getFormData();

    if (!data.title || !data.message) {
        alert("Заполните хотя бы заголовок и текст сообщения");
        return;
    }

    $.ajax({
        url: "/messages",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function() {
            clearForm();
            fetchMessagesFromServer();
        },
        error: function() {
            alert("Ошибка сохранения сообщения на сервере");
        }
    });
}

// Удаление всех заметок
function deleteAllMessages() {
    $.ajax({
        url: "/messages",
        method: "DELETE",
        success: function() {
            fetchMessagesFromServer();
            $("#filtercat").val("Любая");
            alert("Все сообщения удалены");
        },
        error: function() {
            alert("Ошибка очистки сообщений на сервере");
        }
    });
}

// Сбор данных из полей формы
function getFormData() {
    var topicRaw = $("#topic").val() || "";
    var topic = topicRaw;
    if (/^\d+$/.test(topicRaw)) {
        topic = "Тема " + topicRaw;
    }

    return {
        title: $("#title").val() || "",
        topic: topic,
        date: $("#date").val() || "",
        category: $("#category").val(),
        message: $("#message").val() || "",
        newStyle: $("#switch1").is(":checked"),
        html: $("#switch2").is(":checked")
    };
}

// Очистка полей формы
function clearForm() {
    $("#title").val("");
    $("#topic").val("");
    $("#date").val("");
    $("#message").val("");
    
    if (categories.length > 0) {
        $("#category").val(categories);
    }
    $("#switch1").prop("checked", false);
    $("#switch2").prop("checked", false);
}


function viewForm() {
    var d = getFormData();
    alert("Данные формы:\n" + JSON.stringify(d, null, 2));
}

// Структура для одной заметки
function renderOneMessage(msg, index, visibleIndex) {
    var side = (visibleIndex % 2 === 0) ? "left" : "right";

    var $wrap = $('<div class="msg-wrap ' + side + '"></div>');

    var styleClass = msg.newStyle ? "new-style" : "default-style";
    var $msg = $('<div class="msg ' + styleClass + '"></div>');

    $msg.append("<b>Заголовок: " + msg.title + "</b><br>");
    $msg.append(msg.topic + "<br>");
    $msg.append("Категория: " + msg.category + "<br>");

    $msg.append(
        '<span>Дата ' + msg.date + '</span> ' +
        '<a href="#" class="msg-delete" data-index="' + index + '">Удалить</a><br><br>'
    );

    if (msg.html) {
        $msg.append(msg.message);
    } else {
        $msg.append(document.createTextNode(msg.message));
    }

    $wrap.append($msg);
    return $wrap;
}


function renderMessages() {
    var $area = $(".messages-area");
    $area.empty();

    messages.forEach(function(m, i) {
        $area.append(renderOneMessage(m, i, i));
    });
}

// Фильтрация заметок по выбранной категории
function filterMessages() {
    var chosen = $("#filtercat").val();
    var $area = $(".messages-area");
    $area.empty();

    var visibleIndex = 0;

    messages.forEach(function(m, i) {
        if (chosen === "Любая" || m.category === chosen) {
            $area.append(renderOneMessage(m, i, visibleIndex));
            visibleIndex++;
        }
    });
}

// Удаление одной конкретной заметки 
function handleDelete(e) {
    e.preventDefault();
    var idx = parseInt($(this).attr("data-index"));
    
    
    messages.splice(idx, 1);
    
    
    filterMessages();
}

// Заполнение выпадающих списков категорий
function fillSelects() {
    var $cat = $("#category");
    var $filter = $("#filtercat");

    $cat.empty();
    $filter.empty();

    
    $filter.append($("<option>").val("Любая").text("Любая"));

    
    categories.forEach(function(c) {
        $cat.append($("<option>").val(c).text(c));
        $filter.append($("<option>").val(c).text(c));
    });
}

// Автор
function showAuthorInfo(e) {
    e.preventDefault();
    alert("Студент: Timoshenko Egor\nГруппа: 4244");
}

// Нажатие кнопок
function bindHandlers() {
    $("#view").on("click", viewForm);
    $("#clearform").on("click", function(e){ e.preventDefault(); clearForm(); });
    $("#send").on("click", function(e){ e.preventDefault(); sendForm(); });
    $("#search").on("click", function(e){ e.preventDefault(); filterMessages(); });
    $("#clearfilter").on("click", function(e){ e.preventDefault(); deleteAllMessages(); });
    $(".messages-area").on("click", ".msg-delete", handleDelete);
    $(".author a").on("click", showAuthorInfo);
}

// Иницилизация при загрузке страницы
$(document).ready(function() {
    fetchCategoriesFromServer();
    fetchMessagesFromServer();
    bindHandlers();
});