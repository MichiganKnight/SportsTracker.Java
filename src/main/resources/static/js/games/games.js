document.addEventListener("DOMContentLoaded", () => {
    const modal =
        document.getElementById("gamesDateModal");

    const monthLabel =
        document.getElementById("games-calendar-month");

    const daysContainer =
        document.getElementById("games-calendar-days");

    const previousButton =
        document.getElementById("games-calendar-previous");

    const nextButton =
        document.getElementById("games-calendar-next");

    if (
        !modal ||
        !monthLabel ||
        !daysContainer ||
        !previousButton ||
        !nextButton
    ) {
        return;
    }

    const selectedDate =
        parseDate(modal.dataset.selectedDate);

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);

    let displayedYear =
        selectedDate.getFullYear();

    let displayedMonth =
        selectedDate.getMonth();

    previousButton.addEventListener("click", () => {
        displayedMonth--;

        if (displayedMonth < 0) {
            displayedMonth = 11;
            displayedYear--;
        }

        renderCalendar();
    });

    nextButton.addEventListener("click", () => {
        displayedMonth++;

        if (displayedMonth > 11) {
            displayedMonth = 0;
            displayedYear++;
        }

        renderCalendar();
    });

    modal.addEventListener("show.bs.modal", () => {
        displayedYear =
            selectedDate.getFullYear();

        displayedMonth =
            selectedDate.getMonth();

        renderCalendar();
    });

    function renderCalendar() {
        monthLabel.textContent =
            new Date(
                displayedYear,
                displayedMonth,
                1
            ).toLocaleDateString(
                undefined,
                {
                    month: "long",
                    year: "numeric"
                });

        daysContainer.innerHTML = "";

        const firstDay =
            new Date(
                displayedYear,
                displayedMonth,
                1
            ).getDay();

        const daysInMonth =
            new Date(
                displayedYear,
                displayedMonth + 1,
                0
            ).getDate();

        for (let i = 0; i < firstDay; i++) {
            const empty =
                document.createElement("div");

            empty.className =
                "games-calendar-empty";

            daysContainer.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date =
                new Date(
                    displayedYear,
                    displayedMonth,
                    day);

            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "games-calendar-day";

            button.textContent =
                day.toString();

            if (isSameDate(date, today)) {
                button.classList.add(
                    "is-today");
            }

            if (isSameDate(date, selectedDate)) {
                button.classList.add(
                    "is-selected");
            }

            button.addEventListener("click", () => {
                navigateToDate(date);
            });

            daysContainer.appendChild(button);
        }
    }

    function navigateToDate(date) {
        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        const value =
            `${year}-${month}-${day}`;

        window.location.href =
            `/games?date=${encodeURIComponent(value)}`;
    }

    function isSameDate(first, second) {
        return (
            first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate()
        );
    }

    function parseDate(value) {
        const [year, month, day] =
            value
                .split("-")
                .map(Number);

        return new Date(
            year,
            month - 1,
            day);
    }
});