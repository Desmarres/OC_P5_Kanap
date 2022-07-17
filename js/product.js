document.addEventListener('DOMContentLoaded', function(event) {

    /* récupération du produits de l'API*/
    fetch("https://desmarres-p5-kanap.herokuapp.com/api/products/" + id)
    .then(function(res){
        if (res.ok) {
            return res.json();
        }
    })
    .then(function(product){
        displayproduct(product);
    })
    .catch(function(err){
        console.log("Une erreur est survenue lors de la récupération des produits : " + err);
    });
    addProductToBag();
});

/* récupération de l'ID du produit */
var id = getProductId();

/* récupération de élément "addToCart" du DOM */
var buttonAddToCart = document.getElementById("addToCart");

/* récupération de élément "quantity" du DOM */
var labelItemQuantity = document.getElementById("quantity");

/* récupération de élément "color-select" du DOM */
var selectColors = document.getElementById("colors");

/* fonction recupération de l'id du produit dans l'URL => retourne id*/
function getProductId(){

    /*recupère les paramètre de l'URL*/
    var url = new URL(window.location.href);
    var search_params = new URLSearchParams(url.search);

    /* vérifie la présence de l'attribut ID */
    if(search_params.has('id')) {

        /* retourne l'ID */
        return search_params.get('id');
    }
}

/* fonction affichage produit*/
function displayproduct(product) {
        
    /* récupération de élément "item__img" du DOM */
    var divItemsImg = document.getElementsByClassName("item__img")[0];
    
    /*création de l'élément Img du produit*/     
    var elementImg = document.createElement("img");
    elementImg.setAttribute("src",product.imageUrl.replace("p","ps"));
    elementImg.setAttribute("alt",product.altTxt);

    /*modification de l'élément H1 "title" du produit*/
    var elementH1 = document.getElementById("title");
    elementH1.innerHTML = product.name;
    
    /*modification de l'élément span "price" du produit*/
    var elementSpan = document.getElementById("price");
    elementSpan.innerHTML = product.price;

    /*modification de l'élément p "description" du produit*/
    var elementSpan = document.getElementById("description");
    elementSpan.innerHTML = product.description;

    /*création des éléments option "color-select" du produit*/
    for (var i = 0; i < product.colors.length; i++){
        var elementOption = document.createElement("option");
        elementOption.setAttribute("value",product.colors[i]);
        elementOption.innerHTML = product.colors[i];
        selectColors.appendChild(elementOption);
    }

    /*ajout des éléments aux DOM*/
    divItemsImg.appendChild(elementImg);
}

function addProductToBag(){
    /* écoute du click sur le bouton AddToCart*/
    buttonAddToCart.addEventListener('click',function(){

        /* recupération des élément du formulaire */
        var quantity = parseInt(labelItemQuantity.value);
        var color = selectColors.value;

        /* contrôle si tout les champs du formulaire sont remplis*/
        if (quantity != 0 && color != ""){
                
            var bag =[];

            /* si le panier existe*/
            if (localStorage.getItem("article")){

                /* récuperation du panier */
                var bagJSON = localStorage.getItem("article");
                bag = bagJSON && JSON.parse(bagJSON);

                /* vérification de la présence du produit*/
                var productExist = false;

                for (var i = 0; i < bag.length; i++){

                    /* Si le produit est présent on incrémente la quantité*/
                    if ((bag[i].id == id) && (bag[i].color == color)){
                        bag[i].quantity += quantity;
                        productExist = true;
                    }
                }

                /* si le produit n'éxiste pas on l'ajoute au panier*/
                if (!productExist) {
                    ajoutArticle(bag.length);
                }
            }
            else{
                ajoutArticle(0);
            }

            function ajoutArticle(numberArticle){
                var article = {
                    id: id,
                    quantity: quantity,
                    color: color
                };
                bag[numberArticle] = article;
            }

            /* mise a jour du panier dans le local Storage*/
            localStorage.setItem("article", JSON.stringify(bag));

            /* récupération de élément "h1" du DOM */
            var nom = document.getElementById("title").innerHTML;

            /* message de confirmation de l'ajout de l'article au panier */
            var exemplaire = "exemplaire";
            var ajout = "a bien été ajouté";
            if (quantity>1) {
                exemplaire += "s";
                ajout = "ont bien été ajoutés";
            }

            alert(quantity + " " + exemplaire + " '" + color + "' " + " de l'article " + nom + ", " + ajout + " dans le panier");
        }
        else{
            /* message sur les éléments manquants du formulaire*/
            var messageCommande = "";
            if (quantity == 0){
                messageCommande = "Vous n'avez pas renseigné la quantité";
                if (color == ""){
                    messageCommande += " et la couleur";
                }
            }
            else{
                messageCommande = "Vous n'avez pas renseigné la couleur";
            }
            alert(messageCommande);
        }
    })
}