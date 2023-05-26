import { getPhotographersById } from "../utils/getPhotographerById.js";
import { photographerFactory } from "../factories/photographer.js";
import { openOptionsList, selectOption } from "../utils/sortButton.js";
import { createSortedMediasCards } from "../utils/sortMedias.js";
import { getMediasByPhotographer } from "../utils/getMediasByPhotographer.js";
import { openContactForm } from "../utils/contactForm.js";
import { disableLightboxButtons, openLightbox } from "../utils/lightBox.js";

const main = document.querySelector("main");
let mediaLightboxId = 0;

async function displayPhotographerHeader() {
  // affiche les informations de chaque photographe
  const photographer = await getPhotographersById();
  const datas = photographerFactory(photographer).getUserHeader();
  const photographerHeader = document.createElement("section");
  photographerHeader.classList.add("photographer__header");
  photographerHeader.innerHTML = datas
  main.appendChild(photographerHeader);
}

async function displaySortSection() {
  // affiche la section qui contient le bouton de tri des medias
  const sortSection = document.createElement("section");
  sortSection.classList.add("sort");
  main.appendChild(sortSection)

  const selectLabel = document.createElement("label");
  selectLabel.classList.add("sort__label");
  selectLabel.innerText = "Trier par"

  const selectDiv = document.createElement("div");
  selectDiv.classList.add("sort__select");
  selectDiv.setAttribute("aria-label", "Order by");
  selectDiv.setAttribute("data-value", "popularity");

  const sortBtn = document.createElement("button");
  sortBtn.innerText = "Popularité";
  sortBtn.setAttribute("aria-haspopup", "list");
  sortBtn.id = "sort__button";
  sortBtn.classList.add("sort__button", "button");
  selectDiv.appendChild(sortBtn);

  const arrow = document.createElement("i");
  arrow.classList.add("sort__down", "fa-solid", "fa-caret-down");
  selectDiv.appendChild(arrow);

  const sortList = document.createElement("ul");
  sortList.classList.add("sort__options");
  sortList.setAttribute("role", "list");
  sortList.setAttribute("aria-labelledby", "sort__button");
  sortList.setAttribute("aria-activedescendant", "popularity");

  sortList.innerHTML = `
  <li
    class="sort__hide sort__option"
    data-value="popularity"
    role="option"
    id="popularity"
    aria-selected="true"
    style="display: none;"
    tabindex="0">Popularité</li>
  <li
    class="sort__option"
    data-value="date"
    role="option"
    id="date"
    tabindex="0">Date</li>
  <li
    class="sort__option"
    data-value="title"
    role="option"
    id="title"
    tabindex="0">Titre</li>
  `

  selectDiv.appendChild(sortList);
  sortSection.appendChild(selectLabel);
  sortSection.appendChild(selectDiv);
}

async function displayPhotographerMedias() {
  // affiche la section contenant les medias des photographes, et appelle la fonction créant les cards pour chaque média

  const mediaSection = document.createElement("section");
  mediaSection.classList.add("photographer__content");
  main.appendChild(mediaSection);
  await createSortedMediasCards();
  const medias = document.querySelectorAll(".media");

  // pour chaque média, on crée un attribut indexNumber correspondant au numéro d'index dans l'array de médias
  for (let i = 0; i < medias.length; i++) {
    medias[i].dataset.index = i
  }
}
function displaySortedMedias() {
  // affiche les médias en fonction du tri demandé lors du click sur le choix de tri

  const options = document.querySelectorAll(".sort__option");
  options.forEach(option => {
    option.addEventListener("click", () => {
      document.querySelector(".photographer__content").innerHTML = "";
      setTimeout(async() => {
        await displayPhotographerMedias();
      }, 1);
    })
  })
}

async function displayLikesCounter() {
  // crée et affiche une div contenant le total de like et le prix journalier du photographe
  const photographer = await getPhotographersById();
  const likesDiv = document.createElement("div");
  likesDiv.classList.add("likes__counter")
  main.appendChild(likesDiv)
  const medias = await getMediasByPhotographer();
  let totalLikes = 0;
  medias.forEach(media => {
    totalLikes += media.likes
  });
  likesDiv.innerHTML += `
  <p class="likes">${totalLikes} <i class="fa-solid fa-heart "></i></p>
  <p class="price">${photographer.price}€ / jour</p>
  `
}

// récupère la valuer de data-index pour le média actuel
// function findCurrentMediaIndex(media) {
//   console.log(media);
//   const index = parseInt(media.dataset.index, 10);
//   console.log(index);
//   return index;
// }

// function nextMedia(media, medias) {
//   let index = findCurrentMediaIndex(media)
//   if (index < medias.length - 2) {
//     index = index + 1
//   }
//   return index;
// }

// function previousMedia(media) {
//   // const previous = document.querySelector(".lightboxModal__previous");
//   let index = findCurrentMediaIndex(media)
//   if (index > 0) {
//     index = index - 1
//   }
//   console.log(index);
//   // previous.parentElement.firstChild.remove();
// }

// fonction qui crée la card du média, en fonction de si c'est une image ou une vidéo
async function renderMedia(mediaId) {
  const medias = await getMediasByPhotographer();
  const media = medias.find((media) => media.id == mediaId)
  const { title, image, video, photographerId} = media
  mediaLightboxId = mediaId;
  const lightbox = document.querySelector(".lightboxModal");
  console.log(media);

  if (media.image) {
    const lightboxImg = document.createElement("img");
    lightboxImg.src = `assets/photographers/${photographerId}/${image}`;
    lightboxImg.alt = `${title}`;
    lightboxImg.classList.add("lightboxModal__img");
    lightbox.prepend(lightboxImg);
  } else if (media.video) {
    const lightboxVideo = document.createElement("video");
    lightboxVideo.controls = "true";
    lightboxVideo.classList.add("lightboxModal__video")
    lightbox.prepend(lightboxVideo);
    const lightboxVideoSrc = document.createElement("source");
    lightboxVideoSrc.src = `assets/photographers/${photographerId}/${video}`;
    lightboxVideoSrc.type = "video/mp4";
    lightboxVideo.appendChild(lightboxVideoSrc);
  }
}

// au click sur un média, on récupère son index dans l'array de média trié, et on l'affiche en fonction de son index dans la lightbox
function displayMediasInLightbox() {
  const mediaColl = document.querySelectorAll(".media");
  const medias = Array.from(mediaColl);
  const mediasLength = medias.length;
  medias.forEach(media => {
    media.addEventListener("click", (event) => {
      const mediaId = media.id
      openLightbox();
      renderMedia(mediaId);
      // disableLightboxButtons(index, mediasLength);
    })
  })

  // au click sur le bouton next, on récupère le nouvel index, et on rappelle la fonction pour créer l'html du média
  const next = document.querySelector(".lightboxModal__next");

  next.addEventListener("click", (event) => {
    console.log(event.currentTarget.parentElement);
    console.log(event.currentTarget.parentElement.firstChild);

    const modal = document.querySelector(".lightboxModal");
    modal.firstChild.remove();
    console.log(modal);
    // event.currentTarget.parentElement.firstChild.remove();
  //   const media = medias.find(media => media.id)
  //   const mediaIndex = findCurrentMediaIndex(media)
  //   console.log(media);
  //   const nextIndex = nextMedia(media, medias);
  //   createMedia(nextIndex, medias);
  })


}

async function init() {
  await displayPhotographerHeader()
  await displaySortSection();
  await displayLikesCounter();
  await displayPhotographerMedias();
  displaySortedMedias();
  openOptionsList();
  selectOption();
  openContactForm();
  displayMediasInLightbox()
}

init();
