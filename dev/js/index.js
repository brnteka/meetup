import './mobile-nav'

const meetupList = document.querySelector('.meetups__list');
const meetupItems = meetupList.querySelectorAll('.meetup__item')
const toggleMeetup = document.getElementById('pastevents-button');

let meetupsVisible = false


function handleMeetups(array) {
	array.forEach(function (el) {
		if (!el.classList.contains('is-visible')) {
			el.classList.add('is-visible')
		}
	})
}

function hideMeetups(array) {
	array.forEach(function (el, index) {
		if (index > 0) {
			el.classList.remove('is-visible')
		}
	})
}

toggleMeetup.addEventListener('click', function () {
	if (meetupsVisible) {
		hideMeetups(meetupItems);
		this.textContent = "Прошедшие мероприятия"
		meetupsVisible = false
	} else {
		handleMeetups(meetupItems)
		this.textContent = "Скрыть"
		meetupsVisible = true
	}
})