// on load set the flatpickr date picker
document.addEventListener('DOMContentLoaded', function () {
    // set the date format to dd.mm.yyyy
    flatpickr(".date-picker", {
        dateFormat: "d.m.Y",
        altInput: true,
        altFormat: "d.m.Y"
    });

    flatpickr("#start-date", {
        dateFormat: "d.m.Y",
        defaultDate: "today",
        minDate: "today"
    });

    // set the first exam in 2 months
    flatpickr("#firstExam", {
        dateFormat: "d.m.Y",
        defaultDate: new Date().setMonth(new Date().getMonth() + 2),
        minDate: "today"
    });

    flatpickr("#off-days", {
        dateFormat: "d.m.Y",
        mode: "multiple",
        altInput: true,
        altFormat: "d.m.Y"
    });
    // add a listener to the add row button which will add a new row to the table
    document.getElementsByClassName("add-row")[0].addEventListener("click", function () {
        // insert a new row to the subjects-table
        var table = document.getElementById("subjects-table");
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = '<input type="text" class="form-control" placeholder="Fach">';
        cell2.innerHTML = '<input type="number" class="form-control" placeholder="Gewichtung">';
        cell3.innerHTML = '<input type="text"  class="form-control date-picker examDates" placeholder="Prüfungsdatum auswählen">';
        cell4.innerHTML = '<button class="btn btn-danger remove-row">-</button>';

        // add event listener to the remove button
        cell4.querySelector(".remove-row").addEventListener("click", function () {
            table.deleteRow(row.rowIndex);
        });
        // add date picker to the new row
        flatpickr(".examDates", {
            dateFormat: "d.m.Y",
            minDate: "today"
        });
    });

    document.getElementById("generate-plan").addEventListener("click", function () {
        // Sammle die Daten aus dem Formular
        const weights = {};
        const examDates = {};
        const subjectRows = document.getElementById("subjects-table").getElementsByTagName("tr");

        for (let row of subjectRows) {
            let subject = row.cells[0].querySelector("input").value;
            let weight = parseInt(row.cells[1].querySelector("input").value, 10);
            let examDate = row.cells[2].querySelector("input").value;
            weights[subject] = weight;
            examDates[subject] = examDate;
        }

        const startingDate = document.getElementById("start-date").value;
        const offDays = document.getElementById("off-days").value.split(", ");

        // Hier müsstest du die Daten an deine Python-Funktion senden
        console.log("Gewichtungen:", weights);
        console.log("Startdatum:", startingDate);
        console.log("Freie Tage:", offDays);
        console.log("Prüfungsdaten:", examDates);

        // Hol das Prüfungsdatum mit der höchsten jahreszahl, dann monat und dann tag
        const examDatesArray = Object.values(examDates);
        const maxExamDate = examDatesArray.reduce((maxDate, currentDate) => {
            const maxDateParts = maxDate.split(".");
            const currentDateParts = currentDate.split(".");
            const maxDateObj = new Date(maxDateParts[2], maxDateParts[1] - 1, maxDateParts[0]);
            const currentDateObj = new Date(currentDateParts[2], currentDateParts[1] - 1, currentDateParts[0]);
            return currentDateObj > maxDateObj ? currentDate : maxDate;
        });

        const maxExamDateParts = maxExamDate.split(".");
        const maxExamDateObj = new Date(maxExamDateParts[2], maxExamDateParts[1] - 1, maxExamDateParts[0]);

        // Berechne die Anzahl der Tage zwischen dem startdatum und dem letzten Prüfungsdatum
        const startingDateParts = startingDate.split(".");
        const startingDateObj = new Date(startingDateParts[2], startingDateParts[1] - 1, startingDateParts[0]);
        const diffTime = Math.abs(maxExamDateObj - startingDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log("Anzahl der Tage:", diffDays);

        // kreier ein Array mit 4 reihen und (anzahl tage) spalten alles mit nullen gefüllt 1. reihe datum, 2. reihe wochentag 3. und 4. reihen nullen
        const plan = Array.from({ length: 4 }, () => Array(diffDays).fill(null));

        // add the wochentage to the plan
        const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
        for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(startingDateObj);
            currentDate.setDate(currentDate.getDate() + i);
            const currentDay = days[currentDate.getDay()];
            plan[1][i] = currentDay;
        }

        console.log("Plan:", plan);

        // gehe durch alle off days durch
        if (offDays[0] !== "") {
            for (let offDay of offDays) {
                // finde den index des off days im plan und setze in der 3. und 4. reihe ein "frei" ein
                console.log("Off day:", offDay);

                // setze den wert aus der 3. und 4. reihe auf "frei"
                const offDayParts = offDay.split(".");
                const offDayObj = new Date(offDayParts[2], offDayParts[1] - 1, offDayParts[0]);
                const diffTime = Math.abs(offDayObj - startingDateObj);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const index = diffDays;

                plan[2][index] = "frei";
                plan[3][index] = "frei";

                console.log("Index:", index);
            }
        }

        // gehe durch alle prüfungsdaten durch
        for (let subject in examDates) {
            // finde den index des prüfungsdatums im plan und setze in der 3. und 4. reihe den fachnamen ein
            console.log("Prüfungsdatum:", examDates[subject]);

            // setze den wert aus der 3. und 4. reihe auf den fachnamen
            const examDateParts = examDates[subject].split(".");
            const examDateObj = new Date(examDateParts[2], examDateParts[1] - 1, examDateParts[0]);
            const diffTime = Math.abs(examDateObj - startingDateObj);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const index = diffDays;

            plan[2][index] = "Prüfung: " + subject;
            plan[3][index] = "Prüfung: " + subject;

            console.log("Index:", index);
        }

        // zähle wie viele nullen es in der 3. und 4. reihe gibt
        const freeDays = plan[2].filter(day => day === null).length;
        console.log("Freie Tage:", freeDays);

        // zähle alle gewichtungen zusammen
        const totalWeight = Object.values(weights).reduce((total, weight) => total + weight, 0);
        console.log("Gesamtgewichtung:", totalWeight);


        // berechne wie viele halbe tage es pro fach gibt (wenn es nicht aufgeht sollen die stärkeren fächer mehr halbe tage bekommen)
        const subjectsHalfDays = {};
        for (let subject in weights) {
            subjectsHalfDays[subject] = Math.round((weights[subject] / totalWeight) * (diffDays - freeDays));
        }
        console.log("Halbe Tage pro Fach:", subjectsHalfDays);

        // sortiere die fächer nach dem zeitpunkt der prüfung
        const sortedSubjects = Object.keys(examDates).sort((a, b) => {
            const aParts = examDates[a].split(".");
            const bParts = examDates[b].split(".");
            const aObj = new Date(aParts[2], aParts[1] - 1, aParts[0]);
            const bObj = new Date(bParts[2], bParts[1] - 1, bParts[0]);
            return aObj - bObj;
        });
        console.log("Sortierte Fächer:", sortedSubjects);


        // starte mit der ersten prüfung und gehe wie in diesem python durch alle durch:
    //     # Allocate learning times for each subject
    // for subject in sorted_subjects:
    //     rowidx_exam = days.index(examDates[subject])
    //     lernPlan_exam = lernPlan[:rowidx_exam, :]
    //     available_slots = np.argwhere(lernPlan_exam == 0)

    //     if len(available_slots) >= subjects_half_days[subject]:
    //         selected_slots = np.linspace(0, len(available_slots) - 1, subjects_half_days[subject], dtype=int)
    //         for idx in selected_slots:
    //             slot = available_slots[idx]
    //             lernPlan[slot[0], slot[1]] = subject

        for (let subject of sortedSubjects) {
            const rowidxExam = days.indexOf(examDates[subject]);
            const lernPlanExam = plan.slice(0, rowidxExam);
            const availableSlots = [];
            for (let i = 0; i < lernPlanExam[0].length; i++) {
                if (lernPlanExam[0][i] === null) {
                    availableSlots.push(i);
                }
            }

            if (availableSlots.length >= subjectsHalfDays[subject]) {
                const selectedSlots = availableSlots.slice(0, subjectsHalfDays[subject]);
                for (let idx of selectedSlots) {
                    plan[0][idx] = subject + " lernen";
                }
            }
        }

        // stelle den lernplan dar in der tabelle #lernplan-table (erste reihe datum, zweite reihe wochentag, dritte reihe fach, vierte reihe fach)
        const lernPlanTable = document.getElementById("lernplan-table");
        for (let i = 0; i < plan[0].length; i++) {
            var row = lernPlanTable.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            cell1.innerHTML = startingDateObj.getDate() + i + "." + (startingDateObj.getMonth() + 1) + "." + startingDateObj.getFullYear();
            cell2.innerHTML = plan[1][i];
            cell3.innerHTML = plan[2][i];
            cell4.innerHTML = plan[3][i];
        }


    });

});
