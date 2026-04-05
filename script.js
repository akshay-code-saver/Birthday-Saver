document.addEventListener('DOMContentLoaded', () => {
    const birthdayForm = document.getElementById('birthday-form');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const birthdayList = document.getElementById('birthday-list');
    const loadingMessage = document.getElementById('loading-message');

    // Populate Day dropdown
    const populateDays = (month) => {
        daySelect.innerHTML = '<option value="" disabled selected>Day</option>';
        if (month === null || month === undefined || month === "") return;

        const year = new Date().getFullYear();
        const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    };

    monthSelect.addEventListener('change', (e) => {
        populateDays(e.target.value);
    });

    // Load birthdays from local storage
    const loadBirthdays = () => {
        let birthdays = JSON.parse(localStorage.getItem('birthdays'));
        
        if (birthdays === null) {
            // Add sample birthdays only on the very first load
            birthdays = [
                {
                    username: 'Stellar_Endgame',
                    month: 3, // April
                    day: 5,
                    note: 'Join my club "The Club Of 129 Countries"',
                    id: 1
                },
                {
                    username: 'ved2714',
                    month: 0, // January
                    day: 27,
                    note: 'Aura Farmer',
                    id: 2
                },
                {
                    username: 'corsivio',
                    month: 4, // May
                    day: 12,
                    note: 'Chess Enthusiast',
                    id: 3
                }
            ];
            localStorage.setItem('birthdays', JSON.stringify(birthdays));
        }
        
        displayBirthdays(birthdays);
    };

    // Calculate days until birthday
    const getDaysUntil = (month, day) => {
        const today = new Date();
        const birthdayDate = new Date(today.getFullYear(), month, day);

        if (birthdayDate < today && (birthdayDate.getMonth() !== today.getMonth() || birthdayDate.getDate() !== today.getDate())) {
            birthdayDate.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = Math.abs(birthdayDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (today.getMonth() === month && today.getDate() === day) {
            return 0;
        }
        
        return diffDays;
    };

    // Display birthdays
    const displayBirthdays = (birthdays) => {
        birthdayList.innerHTML = '';
        loadingMessage.style.display = 'none';

        if (birthdays.length === 0) {
            birthdayList.innerHTML = '<div style="text-align: center; color: #9dabbb; font-size: 14px;">No birthdays added yet.</div>';
            return;
        }

        // Sort birthdays by days until
        const sortedBirthdays = birthdays.map(b => ({
            ...b,
            daysUntil: getDaysUntil(parseInt(b.month), parseInt(b.day))
        })).sort((a, b) => a.daysUntil - b.daysUntil);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        sortedBirthdays.forEach(b => {
            const item = document.createElement('div');
            item.className = 'birthday-item';

            const countdownText = b.daysUntil === 0 ? 'Today!' : `in ${b.daysUntil} days`;
            const dateText = `${monthNames[b.month]} ${b.day}`;

            item.innerHTML = `
                <div class="birthday-info">
                    <div class="user-name-note">
                        <span class="user-name">${b.username}</span>
                        ${b.note ? `<span class="user-note">· ${b.note}</span>` : ''}
                    </div>
                    <div class="birthday-date-countdown">
                        <span class="date">${dateText}</span>
                        · <span class="countdown">${countdownText}</span>
                    </div>
                </div>
                <button class="item-delete-btn" data-id="${b.id}">&times;</button>
            `;
            birthdayList.appendChild(item);
        });

        // Add event listeners for the new delete buttons
        document.querySelectorAll('.item-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                let currentBirthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
                currentBirthdays = currentBirthdays.filter(item => item.id !== id);
                localStorage.setItem('birthdays', JSON.stringify(currentBirthdays));
                loadBirthdays();
            });
        });

        // Keep the clear all button at the bottom as well
        if (birthdays.length > 0) {
            const clearButton = document.createElement('button');
            clearButton.className = 'delete-btn';
            clearButton.innerHTML = 'Clear All';
            clearButton.addEventListener('click', () => {
                localStorage.setItem('birthdays', JSON.stringify([]));
                loadBirthdays();
            });
            birthdayList.appendChild(clearButton);
        }
    };

    // Handle form submission
    birthdayForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const month = monthSelect.value;
        const day = daySelect.value;
        const note = document.getElementById('note').value;

        const newBirthday = {
            username,
            month,
            day,
            note,
            id: Date.now()
        };

        const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
        birthdays.push(newBirthday);
        localStorage.setItem('birthdays', JSON.stringify(birthdays));

        birthdayForm.reset();
        
        // Keep current date in dropdowns
        const currentMonth = new Date().getMonth().toString();
        const currentDay = new Date().getDate();
        monthSelect.value = currentMonth;
        populateDays(currentMonth);
        daySelect.value = currentDay;

        loadBirthdays();
    });

    // Set initial month to current month and populate days
    const today = new Date();
    const currentMonth = today.getMonth().toString();
    const currentDay = today.getDate();
    
    monthSelect.value = currentMonth;
    populateDays(currentMonth);
    daySelect.value = currentDay;

    // Initial load and set interval for live updates
    loadBirthdays();
    setInterval(loadBirthdays, 60000); // Update every minute
});
