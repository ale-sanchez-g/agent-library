package com.agentlibrary.controller;

import com.agentlibrary.model.Post;
import com.agentlibrary.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostService postService;

    @Test
    public void testGetAllPosts() throws Exception {
        Post post1 = new Post(1L, "First Post", "Content of first post", 1L);
        Post post2 = new Post(2L, "Second Post", "Content of second post", 2L);
        
        when(postService.getAllPosts()).thenReturn(Arrays.asList(post1, post2));

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("First Post"));
    }

    @Test
    public void testGetPostsByAuthor() throws Exception {
        Post post = new Post(1L, "First Post", "Content of first post", 1L);
        
        when(postService.getPostsByAuthor(1L)).thenReturn(Arrays.asList(post));

        mockMvc.perform(get("/api/posts?authorId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].authorId").value(1));
    }

    @Test
    public void testGetPostById() throws Exception {
        Post post = new Post(1L, "Test Post", "Test content here", 1L);
        
        when(postService.getPostById(1L)).thenReturn(Optional.of(post));

        mockMvc.perform(get("/api/posts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Post"));
    }

    @Test
    public void testGetPostById_NotFound() throws Exception {
        when(postService.getPostById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/posts/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreatePost() throws Exception {
        Post post = new Post(null, "New Post", "New post content", 1L);
        Post createdPost = new Post(3L, "New Post", "New post content", 1L);
        
        when(postService.createPost(any(Post.class))).thenReturn(createdPost);

        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(post)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3));
    }

    @Test
    public void testUpdatePost() throws Exception {
        Post updatedPost = new Post(1L, "Updated Post", "Updated content", 1L);
        
        when(postService.updatePost(anyLong(), any(Post.class))).thenReturn(Optional.of(updatedPost));

        mockMvc.perform(put("/api/posts/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPost)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Post"));
    }

    @Test
    public void testDeletePost() throws Exception {
        when(postService.deletePost(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/posts/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testDeletePost_NotFound() throws Exception {
        when(postService.deletePost(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/posts/999"))
                .andExpect(status().isNotFound());
    }
}
