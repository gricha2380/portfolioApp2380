if (document.querySelector('#infoIcon')) {
    document.querySelector('#infoIcon').addEventListener('click', ()=>{
        modalAbout();
    })
}

let modalAbout = (asset) => {
    let modalBox = document.createElement('div');
    modalBox.setAttribute("id", "aboutModal");
    modalBox.setAttribute("class", "modal");
    modalBox.innerHTML = 
        `
        <div class="inner">
        <div class="modalTitle center">Portfolio App <span class="minor">2380</span></div>
        <div>
        <div class="madeBy center">Made by Gregor Richardson</div>
        </div>
        <div><a href="https://github.com/gricha2380/portfolioApp2380" target="_blank">Source Code</a></div>
        <div><a href="http://gregorrichardson.com/blog/portfolio-app-v2/" target="_blank">Blog Post</a></div>
        </div>
        `;
    modalBox.querySelector('.inner').innerHTML += 
    `<div class="buttonHolder">
        <div class="primary button save close" id="close">Okay</div>
    </div>`;
    
    document.querySelector("body").append(modalBox);
    modalListeners();
}

let modalListeners = () => {
    console.log('listeners activated')
    let item = document.querySelector('#aboutModal');
    item.addEventListener('click',function(event){
        if (event.target.matches('div.close')) {
            console.log('clicked')
            item.remove();
        } 
    });
}