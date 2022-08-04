/* récupération de élément "addToCart" du DOM */
const buttonAddToCart = document.getElementById("addToCart");

/* récupération de élément "quantity" du DOM */
const labelItemQuantity = document.getElementById("quantity");

/* récupération de élément "color-select" du DOM */
const selectColors = document.getElementById("colors");

/* récupération de l'ID du produit */
const productId = getProductId();

/* récupération de élément "h1" du DOM */
const productName = document.getElementById("title");

/* création de la variable panier */
var bag =[];

/* fonction recupération de l'id du produit dans l'URL => retourne id*/
function getProductId(){

    /*recupère les paramètre de l'URL*/
    let url = new URL(window.location.href);
    let search_params = new URLSearchParams(url.search);

    /* vérifie la présence de l'attribut ID */
    if(search_params.has('id')) {

        /* retourne l'ID */
        return search_params.get('id');
    }
}

/*une fois le DOM chargé*/
document.addEventListener('DOMContentLoaded', function() {

    /* récupération du produits de l'API*/
    fetch("https://desmarres-p5-kanap.herokuapp.com/api/products/" + productId)
    .then(function(res){
        if (res.ok) {
            return res.json();
        }
    })
    .then(function(product){
        displayProduct(product);
        removeQuantityProduct();
        removeColorProduct();
        displayAddToCart();
        addProductToBag();
    })
    .catch(function(err){
        console.log("Une erreur est survenue lors de la récupération des produits : " + err);
        alert("Erreur de communication avec le serveur. Nous ne pouvons pas afficher le produit.");
    });
});

/* fonction affichage produit*/
function displayProduct(product) {
        
    /* récupération de élément "item__img" du DOM */
    const divItemsImg = document.getElementsByClassName("item__img")[0];
    
    /*création de l'élément Img du produit*/     
    const elementImg = document.createElement("img");
    elementImg.setAttribute("src",product.imageUrl.replace("p","ps"));
    elementImg.setAttribute("alt",product.altTxt);

    /*modification de l'élément H1 "title" du produit*/
    const elementH1 = document.getElementById("title");
    elementH1.innerHTML = product.name;
    
    /*modification de l'élément span "price" du produit*/
    const elementSpan = document.getElementById("price");
    elementSpan.innerHTML = product.price;

    /*modification de l'élément p "description" du produit*/
    const elementP = document.getElementById("description");
    elementP.innerHTML = product.description;

    /*création des éléments option "color-select" du produit*/
    for (let i in product.colors){
        let elementOption = document.createElement("option");
        elementOption.setAttribute("value",product.colors[i]);
        elementOption.innerHTML = product.colors[i];
        selectColors.appendChild(elementOption);
    }

    /*ajout des éléments aux DOM*/
    divItemsImg.appendChild(elementImg);
}

/* fonction modification de la quantité du produit */
function removeQuantityProduct(){

    /*ecoute de la modification de quantité du produit */
    labelItemQuantity.addEventListener('change',function(event){

        /*vérification que la quantité est bien correcte*/
        if (!( 0 < parseInt(labelItemQuantity.value) && 101 > parseInt(labelItemQuantity.value))){
            alert("Veuillez saisir un nombre entre 1 et 100");
            labelItemQuantity.value = event.target.defaultValue;
        }
        displayAddToCart()
    })

}

/* fonction modification de la couleur*/
function removeColorProduct(){
    
    /*ecoute de la modification de quantité du produit */
    selectColors.addEventListener('change',function(event){
        displayAddToCart();
    })
}

/* fonction affichage bouton ajout dans le panier*/
function displayAddToCart(){

    /* recupération des élément du formulaire */
    let quantity = parseInt(labelItemQuantity.value);
    let color = selectColors.value;

    /*si le formulaire est valide*/
    if (0 < quantity && 101 > quantity && color != ""){
        buttonAddToCart.style.display = "inline";
    }
    else{
        buttonAddToCart.style.display = "none";
    }
}

/*fonction ajout du produit dans le panier*/
function addProductToBag(){
    /* écoute du click sur le bouton AddToCart*/
    buttonAddToCart.addEventListener('click',function(){

        /* recupération des élément du formulaire */
        var quantity = parseInt(labelItemQuantity.value);
        var color = selectColors.value;

        /* si le panier existe*/
        if (localStorage.getItem("article")){

            /* récuperation du panier */
            var bagJSON = localStorage.getItem("article");
            bag = bagJSON && JSON.parse(bagJSON);

            /* recherche de la présence du produit*/
            const productIndex = bag.findIndex(product => product.id === productId && product.color === color);

            if (productIndex !== -1){

                /* vérification que l'on  ne dépasse pas la limite maximale d'exemplaire*/
                if ((bag[productIndex].quantity + quantity) < 101){
                    bag[productIndex].quantity += quantity;
                    updateLocalStorage(bag[productIndex]);
                }
                else{
                    alert("Votre panier contient déjà " + bag[productIndex].quantity + " exemplaires, la limite de commande par produit est de 100 , vous ne pouvez donc pas commander plus de " + (100 - bag[productIndex].quantity) + " autres exemplaires de cette couleur.");
                }
            }
            else{
                /* si le produit n'éxiste pas on l'ajoute au panier*/
                addArticle(bag.length);
            }
        }
        else{
            addArticle(0);
        }
    })
}

/* function ajout d'article et trie du panier */
function addArticle(numberArticle){
    let article = {
        id: productId,
        quantity: parseInt(labelItemQuantity.value),
        color: selectColors.value
    };
    bag[numberArticle] = article;

    bag = bag.sort(function compare(article1,article2){
        if (article1.id < article2.id){
           return -1;
        }
        else if (article1.id > article2.id ){
           return 1;
        }
        else if (article1.color < article2.color){            
           return -1;
        }
        else if (article1.color > article2.color ){
           return 1;
        }        
        return 0;
    });

    updateLocalStorage(article);
}

/* function de mise a jour du panier dans le local Storage*/
function updateLocalStorage(article){
    
    localStorage.setItem("article", JSON.stringify(bag));

    /* message de confirmation de l'ajout de l'article au panier */
    let exemplaire = "exemplaire";
    let ajout = "a bien été ajouté";
    if (quantity > 1) {
        exemplaire += "s";
        ajout = "ont bien été ajoutés";
    }

    alert("Vous avez " + article.quantity + " " + exemplaire + " en '" + article.color + "' " + " de l'article " + productName.innerHTML + " dans le panier");
}