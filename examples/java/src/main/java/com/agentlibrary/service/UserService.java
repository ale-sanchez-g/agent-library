package com.agentlibrary.service;

import com.agentlibrary.model.User;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for managing users
 */
@Service
public class UserService {
    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public UserService() {
        // Initialize with sample data
        User user1 = new User(idCounter.getAndIncrement(), "John Doe", "john@example.com");
        User user2 = new User(idCounter.getAndIncrement(), "Jane Smith", "jane@example.com");
        users.put(user1.getId(), user1);
        users.put(user2.getId(), user2);
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }

    public Optional<User> getUserById(Long id) {
        return Optional.ofNullable(users.get(id));
    }

    public User createUser(User user) {
        user.setId(idCounter.getAndIncrement());
        users.put(user.getId(), user);
        return user;
    }

    public Optional<User> updateUser(Long id, User updatedUser) {
        if (!users.containsKey(id)) {
            return Optional.empty();
        }
        updatedUser.setId(id);
        users.put(id, updatedUser);
        return Optional.of(updatedUser);
    }

    public boolean deleteUser(Long id) {
        return users.remove(id) != null;
    }

    public List<User> searchUsers(String query) {
        String lowerQuery = query.toLowerCase();
        return users.values().stream()
                .filter(user -> user.getName().toLowerCase().contains(lowerQuery) ||
                               user.getEmail().toLowerCase().contains(lowerQuery))
                .toList();
    }
}
