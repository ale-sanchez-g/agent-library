package com.agentlibrary.service;

import com.agentlibrary.model.Post;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Service for managing posts
 */
@Service
public class PostService {
    private final Map<Long, Post> posts = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public PostService() {
        // Initialize with sample data
        Post post1 = new Post(idCounter.getAndIncrement(), 
            "First Post", 
            "This is the content of the first post.", 
            1L);
        Post post2 = new Post(idCounter.getAndIncrement(), 
            "Second Post", 
            "This is the content of the second post.", 
            2L);
        posts.put(post1.getId(), post1);
        posts.put(post2.getId(), post2);
    }

    public List<Post> getAllPosts() {
        return new ArrayList<>(posts.values());
    }

    public Optional<Post> getPostById(Long id) {
        return Optional.ofNullable(posts.get(id));
    }

    public Post createPost(Post post) {
        post.setId(idCounter.getAndIncrement());
        posts.put(post.getId(), post);
        return post;
    }

    public Optional<Post> updatePost(Long id, Post updatedPost) {
        if (!posts.containsKey(id)) {
            return Optional.empty();
        }
        updatedPost.setId(id);
        posts.put(id, updatedPost);
        return Optional.of(updatedPost);
    }

    public boolean deletePost(Long id) {
        return posts.remove(id) != null;
    }

    public List<Post> getPostsByAuthor(Long authorId) {
        return posts.values().stream()
                .filter(post -> post.getAuthorId().equals(authorId))
                .collect(Collectors.toList());
    }
}
