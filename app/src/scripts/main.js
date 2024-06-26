import { Tooltip } from "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";

import "./ai";
import "./image-page";
import "./video-page";

const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]',
);
for (const element of tooltipTriggerList) {
	new Tooltip(element);
}

const rippleButtons = document.getElementsByClassName("btn-ripple");

for (const button of rippleButtons) {
	button.addEventListener("click", createRipple);
}

function createRipple(event) {
	const button = event.currentTarget;
	const circle = document.createElement("span");
	const diameter = Math.max(button.clientWidth, button.clientHeight);
	const radius = diameter / 2;
	circle.style.width = circle.style.height = `${diameter}px`;
	circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
	circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
	circle.classList.add("ripple");
	const ripple = button.getElementsByClassName("ripple")[0];
	if (ripple) {
		ripple.remove();
	}
	button.appendChild(circle);
}
