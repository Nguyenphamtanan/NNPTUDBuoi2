document.addEventListener('DOMContentLoaded', () => {
    LoadData();        // Load posts khi trang được tải
    LoadComments();    // Load comments khi trang được tải

    // Gắn sự kiện form cho Posts
    const postForm = document.getElementById('post-form');
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveData(); // Thêm/sửa Posts
    });

    // Gắn sự kiện form cho Comments
    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        AddComment(); // Thêm Comments
    });
});

async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById('post-body');
        body.innerHTML = ""; // Làm sạch danh sách trước khi hiển thị lại

        for (const post of posts) {
            body.innerHTML += convertDataToHTML(post);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function convertDataToHTML(post) {
    let isDeletedStyle = post.isDeleted ? 'text-decoration: line-through;' : '';
    let deleteButton = post.isDeleted
        ? ''
        : `<button onclick="Delete(${post.id})">Delete</button>`;

    return `<tr>
        <td style="${isDeletedStyle}">${post.id}</td>
        <td style="${isDeletedStyle}">${post.title}</td>
        <td style="${isDeletedStyle}">${post.views}</td>
        <td>${deleteButton}</td>
    </tr>`;
}

async function saveData() {
    let title = document.getElementById("title_txt").value;
    let view = document.getElementById('views_txt').value;

    let resGET = await fetch('http://localhost:3000/posts');
    if (!resGET.ok) {
        console.error("Failed to fetch existing posts.");
        return false;
    }
    let posts = await resGET.json();
    let maxId = Math.max(0, ...posts.map(post => parseInt(post.id))) || 0;
    let id = (maxId + 1).toString();

    let resPOST = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id,
            title: title,
            views: view,
            isDeleted: false,
        }),
    });

    if (resPOST.ok) {
        console.log("Post created successfully.");
        LoadData();
    } else {
        console.error("Failed to create post.");
    }
}

async function Delete(id) {
    let resPATCH = await fetch(`http://localhost:3000/posts/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            isDeleted: true,
        }),
    });

    if (resPATCH.ok) {
        console.log("Post deleted successfully.");
        LoadData();
    } else {
        console.error("Failed to delete post.");
    }
}

async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let commentBody = document.getElementById('comment-body');
        commentBody.innerHTML = ""; // Làm sạch danh sách trước khi hiển thị lại

        for (const comment of comments) {
            let isDeletedStyle = comment.isDeleted ? 'text-decoration: line-through;' : '';
            let deleteButton = comment.isDeleted
                ? '' // Không hiển thị nút Delete nếu đã xóa mềm
                : `<button onclick="DeleteComment('${comment.id}')">Delete</button>`;

            commentBody.innerHTML += `
                <tr>
                    <td style="${isDeletedStyle}">${comment.id}</td>
                    <td style="${isDeletedStyle}">${comment.text}</td>
                    <td style="${isDeletedStyle}">${comment.postId}</td>
                    <td>${deleteButton}</td>
                </tr>`;
        }
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

async function AddComment() {
    let commentText = document.getElementById('comment_text').value;
    let postId = document.getElementById('comment_postId').value;

    if (!commentText || !postId) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    let resGET = await fetch('http://localhost:3000/comments');
    let comments = await resGET.json();
    let maxId = Math.max(0, ...comments.map(comment => parseInt(comment.id))) || 0;
    let newId = (maxId + 1).toString();

    let resPOST = await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: newId,
            text: commentText,
            postId: postId,
        }),
    });

    if (resPOST.ok) {
        console.log("Comment added successfully.");
        LoadComments();
    } else {
        console.error("Failed to add comment.");
    }
}

async function DeleteComment(id) {
    let resPATCH = await fetch(`http://localhost:3000/comments/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            isDeleted: true, // Xóa mềm (set isDeleted thành true)
        }),
    });

    if (resPATCH.ok) {
        console.log("Comment marked as deleted.");
        LoadComments(); // Tải lại danh sách comments sau khi cập nhật
    } else {
        console.error("Failed to delete comment.");
    }
}