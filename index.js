document.addEventListener("DOMContentLoaded", function() {
    // Dynamically add forum content here
    const forumContainer = document.getElementById('forum-container');

    const announcements = [
        { title: "Welcome to the Student Association Forum!", content: "Welcome to our new forum. Feel free to introduce yourself and start participating in discussions." },
        // Add more announcements as needed
    ];

    const eventUpdates = [
        { title: "Upcoming Workshop on Leadership", content: "Join us for a leadership workshop next Wednesday. Details inside!" },
        // Add more event updates as needed
    ];

    function addCategory(categoryName, threads) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'forum-category';
        const categoryTitle = document.createElement('h3');
        categoryTitle.innerText = categoryName;
        categoryDiv.appendChild(categoryTitle);

        threads.forEach(thread => {
            const threadDiv = document.createElement('div');
            threadDiv.className = 'forum-thread';
            const threadTitle = document.createElement('h4');
            threadTitle.innerText = thread.title;
            const threadContent = document.createElement('p');
            threadContent.innerText = thread.content;
            threadDiv.appendChild(threadTitle);
            threadDiv.appendChild(threadContent);
            categoryDiv.appendChild(threadDiv);
        });

        forumContainer.appendChild(categoryDiv);
    }

    addCategory('Announcements', announcements);
    addCategory('Event Updates', eventUpdates);
});
