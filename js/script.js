
window.addEventListener("DOMContentLoaded", () => {

// Tabs
	const tabContent = document.querySelectorAll(".tabcontent"),
	tabsParent = document.querySelector(".tabheader__items"),
	tabItem = document.querySelectorAll(".tabheader__item");

	function hideAllTabs(){
		tabContent.forEach(item => {
		item.style.display = "none";
	});

	tabItem.forEach(item => {
		item.classList.remove("tabheader__item_active");
	});
	}

	function showTabContent(i = 0){
		tabContent[i].style.display = "block";
		tabItem[i].classList.add("tabheader__item_active");
	}

	tabsParent.addEventListener("click", (event) => {
	let target = event.target;
	if(target && target.classList.contains("tabheader__item")){
		tabItem.forEach((item, index) => {
			if (target == item){
				hideAllTabs();
				showTabContent(index);
			}
		});
	}
	});

	hideAllTabs();
	showTabContent();

// Timers

	const deadline = "2023-01-16T00:00";

	function calcDiffer(endtime){
		const milliseconds = Date.parse(endtime) - Date.parse(new Date()),
					days = Math.floor(milliseconds / (1000 * 60 * 60 * 24)),
					hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24),
					minutes = Math.floor((milliseconds / (1000 * 60)) % 60),
					seconds = Math.floor((milliseconds / 1000) % 60);

		return {
			days,
			hours,
			minutes,
			seconds,
			milliseconds
		};
	}

	function setZero(data){
		if (data >= 0 && data < 10){
			return `0${data}`;
		} else{
			return data;
		}
	}

	function setTime(selector, endtime){
		const timer = document.querySelector(selector),
					days = timer.querySelector("#days"),
					hours = timer.querySelector("#hours"),
					minutes = timer.querySelector("#minutes"),
					seconds = timer.querySelector("#seconds");
		let timerId;

		updateTime();

		function updateTime(){
			const time = calcDiffer(endtime);
			days.innerHTML = setZero(time.days);
			hours.innerHTML = setZero(time.hours);
			minutes.innerHTML = setZero(time.minutes);
			seconds.innerHTML = setZero(time.seconds);

			if (time.milliseconds <= 0){
				if (timerId){
					clearInterval(timerId);
				}
				days.innerHTML = 0;
				hours.innerHTML = 0;
				minutes.innerHTML = 0;
				seconds.innerHTML = 0;
			}
		}

		timerId = setInterval(updateTime, 1000);
	}

	setTime(".timer", deadline);

// Modal window

	const modalWindowBtn = document.querySelectorAll("[data-modal]"),
				modalWindowContent = document.querySelector(".modal");
				// modalWindowCloseBtn = document.querySelector("[data-close]");

	modalWindowBtn.forEach(item => {
		item.addEventListener("click", () => {
			openModal();
		});
	});

	function openModal(){
		modalWindowContent.classList.add("show");
		modalWindowContent.classList.remove("hide");
		document.body.style.overflow = "hidden";
		// clearTimeout(modalTimerId);
	}

	function closeModal(){
		modalWindowContent.classList.add("hide");
		modalWindowContent.classList.remove("show");
		document.body.style.overflow = "";
	}

	// modalWindowCloseBtn.addEventListener("click", closeModal);

	modalWindowContent.addEventListener("click", (e) => {
		if (e.target === modalWindowContent || e.target.getAttribute("data-close") == ""){
			closeModal();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.code == "Escape" && modalWindowContent.classList.contains("show")){
			closeModal();
		}
	});

	// const modalTimerId = setTimeout(openModal, 6000);

	function modalScrollOpen(){
		if (window.pageYOffset + document.documentElement.clientHeight == document.documentElement.scrollHeight){
			openModal();
			window.removeEventListener("scroll", modalScrollOpen);
		}
	}

	window.addEventListener("scroll", modalScrollOpen);

//Создаем класс

	class MenuCard{
		constructor(src, alt, title, descr, price, parentSelector, ...classes){
			this.src = src;
			this.alt = alt;
			this.title = title;
			this.descr = descr;
			this.price = price;
			this.transfer = 70;
			this.parent = document.querySelector(parentSelector);
			this.classes = classes;
			this.transferToRuble();
		}

		transferToRuble(){
			this.price = this.price * this.transfer;
		}

		createCard(){
			let divMenuItem = document.createElement("div");
			if (this.classes.length == 0){
				divMenuItem.className = "menu__item";
			} else{
				this.classes.forEach(item => {
					divMenuItem.classList.add(item);
				});
			}

			divMenuItem.innerHTML = `
				<img src=${this.src} alt=${this.alt}>
				<h3 class="menu__item-subtitle">${this.title}</h3>
				<div class="menu__item-descr">${this.descr}</div>
				<div class="menu__item-divider"></div>
				<div class="menu__item-price">
						<div class="menu__item-cost">Цена:</div>
						<div class="menu__item-total"><span>${this.price}</span> грн/день</div>
				</div>`;

			this.parent.append(divMenuItem);
		}
	}

// Forms POST

	let forms = document.querySelectorAll("form");

	const textMessage = {
		ok: "Всё ок",
		loading: "icons/spinner.svg",
		fail: "Трабл"
	};

	forms.forEach(item => {
		bindPostData(item);
	});

	const postData = async (url, data) =>{
		let res = await fetch(url, {
				method: "POST",
				headers: {
					'Content-type': 'application/json'
				},
				body: data
		});

		return await res.json();
	};

	const getResource = async (url) => {
		let res = await fetch(url);

		if (!res.ok){
			throw new Error(`Error status ${res.status}, status ${res.statusText}`);
		}			

		return await res.json();
	};

	getResource("http://localhost:3000/menu")
	.then(data => {
		data.forEach(({img, altimg, title, descr, price}) => {
			new MenuCard(img, altimg, title, descr, price, ".menu__field .container").createCard();
		});
	});

	function bindPostData(form){
		form.addEventListener("submit", (e) => {
			e.preventDefault();

			let statusMessage = document.createElement("img");
			statusMessage.src = textMessage.loading;
			statusMessage.style.cssText = `
				display: block;
				margin: 0 auto;
			`;
			form.insertAdjacentElement("afterend", statusMessage);

			let formData = new FormData(form);
			// let obj = {};
			// formData.forEach((value, key) => {
			// 	obj[key] = value;
			// });
			// JSON.stringify(obj)

			let json = JSON.stringify(Object.fromEntries(formData.entries()));

			postData("http://localhost:3000/requests", json)
			.then(data => {
				console.log(data);
				showModalThanks(textMessage.ok);
				statusMessage.remove();
			}).catch(() => {
				showModalThanks(textMessage.fail);
			}).finally(() => {
				form.reset();
			});
		});
	}

	function showModalThanks(message){
		let modalDialog = document.querySelector(".modal__dialog");
		modalDialog.classList.add("hide");
		modalDialog.classList.remove("show");

		openModal();

		let modalThanks = document.createElement("div");
		modalThanks.classList.add("modal__dialog");
		modalThanks.innerHTML = `
			<div class="modal__content">
				<div data-close class="modal__close">×</div>
				<div class="modal__title">${message}</div>
			</div>
		`;
		modalWindowContent.append(modalThanks);

		setTimeout(() => {
			modalDialog.classList.add("show");
			modalDialog.classList.remove("hide");
			modalThanks.remove();
			closeModal();
		}, 5000);
	}

// Sliders

	const sliderItems = document.querySelectorAll(".offer__slide"),
				sliderPrev= document.querySelector(".offer__slider-prev"),
				sliderNext = document.querySelector(".offer__slider-next"),
				sliderCurrentNum = document.querySelector("#current"),
				sliderTotalNum = document.querySelector("#total"),
				sliderInner = document.querySelector(".offer__slider-inner"),
				sliderWrap = document.querySelector(".offer__slider-wrapper"),
				sliderContainerDots = document.querySelector(".container-dots"),
				widthSliderWindow = window.getComputedStyle(sliderWrap).width;

	let sliderIndex = 1,
			offset = 0;

	sliderItems.forEach(item => {
		let dot = document.createElement("div");
		dot.classList.add("dot");
		sliderContainerDots.append(dot);
	});

	const sliderDots = document.querySelectorAll(".dot");
	sliderDots[sliderIndex - 1].style.opacity = 1;

	sliderDots.forEach((item, index) => {
		item.addEventListener("click", () => {
			setSliderDot(index);
			sliderIndex = index + 1;
			offset = +widthSliderWindow.slice(0, widthSliderWindow.length - 2) * index;

			sliderInner.style.transform = `translateX(-${offset}px)`;

			setCheckedNumZero(sliderCurrentNum, sliderIndex);
		});
	});

	setCheckedNumZero(sliderTotalNum, sliderItems.length);
	setCheckedNumZero(sliderCurrentNum, sliderIndex);

	sliderInner.style.width = 100 * sliderItems.length + "%";
	sliderInner.style.display = "flex";
	sliderInner.style.transition = "0.5s all";
	sliderWrap.style.overflow = "hidden";

	sliderNext.addEventListener("click", () => {
		if (offset == +widthSliderWindow.slice(0, widthSliderWindow.length - 2) * (sliderItems.length - 1)){
			offset = 0;
			sliderIndex = 1;
		} else{
			offset += +widthSliderWindow.slice(0, widthSliderWindow.length - 2);
			sliderIndex++;
		}

		sliderInner.style.transform = `translateX(-${offset}px)`;

		setCheckedNumZero(sliderCurrentNum, sliderIndex);
		setSliderDot(sliderIndex - 1);
	});

	sliderPrev.addEventListener("click", () => {
		if (offset == 0){
			offset = +widthSliderWindow.slice(0, widthSliderWindow.length - 2) * (sliderItems.length - 1);
			sliderIndex = sliderItems.length;
		} else{
			offset -= +widthSliderWindow.slice(0, widthSliderWindow.length - 2);
			sliderIndex--;
		}
		sliderInner.style.transform = `translateX(-${offset}px)`;

		setCheckedNumZero(sliderCurrentNum, sliderIndex);
		setSliderDot(sliderIndex - 1);
	});

	function setSliderDot(indexDot){
		sliderDots.forEach(item => {
			item.style.opacity = 0.5;
		});
		sliderDots[indexDot].style.opacity = 1;
	}

	function setCheckedNumZero(pos, num){
		if (num < 10){
			pos.textContent = `0${num}`;	
		} else{
			pos.textContent = num;
		}
	}

	//Calc

	const resCal = document.querySelector(".calculating__result span");
	let sex = document.querySelector("#gender div.calculating__choose-item_active").getAttribute("id"),
			height, weight, age,
			ratio = document.querySelector(".calculating__choose_big div.calculating__choose-item_active").getAttribute("data-ratio");

	function calcCal(){
		
		if(!sex || !height || !weight || !age || !ratio){
			resCal.textContent = "____";
			return;
		}

		if (sex == "female"){
			resCal.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
		} else {
			resCal.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
		}
	}

	function getStaticInfo(parentSel, activeClass){
		const elements = document.querySelectorAll(`${parentSel} div`);

		elements.forEach(elem => {
			elem.addEventListener("click", (e) => {
				elements.forEach(item => {
					item.classList.remove(activeClass);
				});

				e.target.classList.add(activeClass);

				if (e.target.hasAttribute("data-ratio")){
					ratio = e.target.getAttribute("data-ratio");
				} else {
					sex = e.target.getAttribute("id");
				}
				calcCal();
			});
		});
	}

	function getDynamicInfo(selectorItem){
		const elem = document.querySelector(selectorItem);

		elem.addEventListener("input", () => {
			if (elem.value.match(/\D/g)){
				elem.style.border = "1px solid red";
			} else {
				elem.style.border = "none";
			}
			switch (elem.getAttribute("id")){
				case "height":
					height = +elem.value;
					break;
				case "weight":
					weight = +elem.value;
					break;
				case "age":
					age = +elem.value;
					break;
			}
			calcCal();
		});
	}

	getStaticInfo("#gender", "calculating__choose-item_active");
	getStaticInfo(".calculating__choose_big", "calculating__choose-item_active");
	getDynamicInfo("#height");
	getDynamicInfo("#weight");
	getDynamicInfo("#age");

	calcCal();

	fetch('https://localhost:3000/menu')
		.then(data => data.json())
		.then(res => console.log(res))
});