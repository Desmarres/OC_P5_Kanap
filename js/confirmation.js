document.addEventListener('DOMContentLoaded', function(event) {

    /* récupération de l'ID de la commande*/
    var id = getOrderId();

    /* récupération du span du DOM*/
    var spanOrderId = document.getElementById("orderId");
    spanOrderId.innerHTML = id;
    
});

/* fonction recupération de l'id du produit dans l'URL => retourne id*/
function getOrderId(){

    /*recupère les paramètre de l'URL*/
    var url = new URL(window.location.href);
    var search_params = new URLSearchParams(url.search);

    /* vérifie la présence de l'attribut ID */
    if(search_params.has('id')) {

        /* retourne l'ID */
        return search_params.get('id');
    }
}
