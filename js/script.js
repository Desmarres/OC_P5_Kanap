document.addEventListener('DOMContentLoaded', function() {

    /* récupération des produits de l'API*/
    fetch("https://desmarres-p5-kanap.herokuapp.com/api/products/")
        .then(function(res){
            if (res.ok) {
                return res.json();
            }
        })
        .then(function(listProduct) {
            displayListProduct(listProduct);
        })
        .catch(function(err){
            console.log("Une erreur est survenue lors de la récupération des produits : " + err);
            alert("Erreur de communication avec le serveur. Nous ne pouvons pas afficher les produits.");
        });
});

/* récupération de la section du DOM */
const sectionItems = document.getElementById("items");

function displayListProduct(listProduct){

    /* parcours de l'ensemble des produits*/
    for (let i in listProduct){

        /*création de l'élément p du produit*/               
        let elementP = document.createElement("p");
        elementP.classList.add("productDescription");
        elementP.innerHTML = listProduct[i].description;

        /*création de l'élément H3 du produit*/     
        let elementH3 = document.createElement("h3");
        elementH3.classList.add("productName");
        elementH3.innerHTML = listProduct[i].name;

        /*création de l'élément Img du produit*/     
        let elementImg = document.createElement("img");
        elementImg.setAttribute("src",listProduct[i].imageUrl.replace("p","ps"));
        elementImg.setAttribute("alt",listProduct[i].altTxt);

        /*création de l'élément Article du produit*/     
        let elementArticle = document.createElement("article");

        /*création de l'élément A du produit*/     
        let elementA = document.createElement("a");
        elementA.setAttribute("href","./html/product.html?id=" + listProduct[i]._id);

        /*ajout des éléments aux DOM*/
        elementArticle.appendChild(elementImg);
        elementArticle.appendChild(elementH3);
        elementArticle.appendChild(elementP);
        elementA.appendChild(elementArticle);
        sectionItems.appendChild(elementA);
    }
}