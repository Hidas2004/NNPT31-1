const API_URL = 'http://localhost:3000';

// Khởi chạy khi load trang
window.onload = function() {
    LoadPosts();
    LoadComments();
}

// ======================= QUẢN LÝ POSTS =======================

function LoadPosts() {
    fetch(`${API_URL}/posts`)
        .then(data => data.json())
        .then(posts => {
            let body = document.getElementById('post-body');
            body.innerHTML = "";
            posts.forEach(post => {
                body.innerHTML += convertPostToHTML(post);
            });
        })
        .catch(err => console.log(err));
}

function convertPostToHTML(post) {
    // Nếu isDeleted = true thì thêm class gạch ngang, nhưng vẫn hiển thị
    const rowClass = post.isDeleted ? 'deleted-item' : '';
    const deleteBtnText = post.isDeleted ? 'Restore' : 'Delete'; // Tuỳ chọn: Có thể làm nút khôi phục
    
    // Nút Edit giúp điền dữ liệu lên form để sửa
    return `<tr class="${rowClass}">
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.views}</td>
        <td>
            ${!post.isDeleted ? `<button onclick='DeletePost("${post.id}")'>Delete</button>` : '<span>Deleted</span>'}
            <button onclick='EditPost("${post.id}", "${post.title}", "${post.views}")'>Edit</button>
        </td>
    </tr>`;
}

function EditPost(id, title, views) {
    document.getElementById("id_txt").value = id;
    document.getElementById("title_txt").value = title;
    document.getElementById("views_txt").value = views;
}

function resetPostForm() {
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

function savePost() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let view = document.getElementById('views_txt').value;

    if (id) {
        // === UPDATE (PUT) ===
        fetch(`${API_URL}/posts/${id}`, {
            method: 'PATCH', // Dùng PATCH để giữ nguyên isDeleted nếu có
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, views: view })
        }).then(res => {
            if (res.ok) {
                LoadPosts();
                resetPostForm();
            }
        });
    } else {
        // === CREATE NEW (AUTO ID) ===
        // 1. Lấy tất cả posts để tìm Max ID
        fetch(`${API_URL}/posts`).then(res => res.json()).then(posts => {
            // Tìm max ID (chuyển về số nguyên để so sánh, vì ID trong DB là chuỗi)
            let maxId = 0;
            posts.forEach(p => {
                let pid = parseInt(p.id);
                if (pid > maxId) maxId = pid;
            });
            
            // ID mới = MaxId + 1 (Chuyển thành chuỗi)
            let newId = (maxId + 1).toString();

            fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: newId,
                    title: title,
                    views: view,
                    isDeleted: false // Mặc định chưa xóa
                })
            }).then(res => {
                if (res.ok) {
                    LoadPosts();
                    resetPostForm();
                }
            });
        });
    }
}

function DeletePost(id) {
    // === SOFT DELETE (PATCH isDeleted = true) ===
    fetch(`${API_URL}/posts/${id}`, {
        method: "PATCH", // Dùng PATCH để cập nhật 1 trường
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: true })
    }).then(function (res) {
        if (res.ok) {
            LoadPosts();
        }
    });
}


// ======================= QUẢN LÝ COMMENTS (Yêu cầu thêm) =======================

function LoadComments() {
    fetch(`${API_URL}/comments`)
        .then(data => data.json())
        .then(comments => {
            let body = document.getElementById('comment-body');
            body.innerHTML = "";
            comments.forEach(c => {
                body.innerHTML += convertCommentToHTML(c);
            });
        })
        .catch(err => console.log(err));
}

function convertCommentToHTML(comment) {
    const rowClass = comment.isDeleted ? 'deleted-item' : '';
    
    return `<tr class="${rowClass}">
        <td>${comment.id}</td>
        <td>${comment.text}</td>
        <td>${comment.postId}</td>
        <td>
            ${!comment.isDeleted ? `<button onclick='DeleteComment("${comment.id}")'>Delete</button>` : '<span>Deleted</span>'}
            <button onclick='EditComment("${comment.id}", "${comment.text}", "${comment.postId}")'>Edit</button>
        </td>
    </tr>`;
}

function EditComment(id, text, postId) {
    document.getElementById("c_id_txt").value = id;
    document.getElementById("c_text_txt").value = text;
    document.getElementById("c_postid_txt").value = postId;
}

function resetCommentForm() {
    document.getElementById("c_id_txt").value = "";
    document.getElementById("c_text_txt").value = "";
    document.getElementById("c_postid_txt").value = "";
}

function saveComment() {
    let id = document.getElementById("c_id_txt").value;
    let text = document.getElementById("c_text_txt").value;
    let postId = document.getElementById('c_postid_txt').value;

    if (id) {
        // UPDATE
        fetch(`${API_URL}/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, postId: postId })
        }).then(res => {
            if (res.ok) {
                LoadComments();
                resetCommentForm();
            }
        });
    } else {
        // CREATE NEW (AUTO ID)
        fetch(`${API_URL}/comments`).then(res => res.json()).then(comments => {
            let maxId = 0;
            comments.forEach(c => {
                let cid = parseInt(c.id);
                if (cid > maxId) maxId = cid;
            });
            let newId = (maxId + 1).toString();

            fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: newId,
                    text: text,
                    postId: postId,
                    isDeleted: false
                })
            }).then(res => {
                if (res.ok) {
                    LoadComments();
                    resetCommentForm();
                }
            });
        });
    }
}

function DeleteComment(id) {
    // SOFT DELETE
    fetch(`${API_URL}/comments/${id}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: true })
    }).then(function (res) {
        if (res.ok) {
            LoadComments();
        }
    });
}