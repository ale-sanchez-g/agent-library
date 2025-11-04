package com.agentlibrary.service;

import com.agentlibrary.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class UserServiceTest {

    private UserService userService;

    @BeforeEach
    public void setUp() {
        userService = new UserService();
    }

    @Test
    public void testGetAllUsers() {
        List<User> users = userService.getAllUsers();
        assertNotNull(users);
        assertEquals(2, users.size());
    }

    @Test
    public void testGetUserById() {
        Optional<User> user = userService.getUserById(1L);
        assertTrue(user.isPresent());
        assertEquals("John Doe", user.get().getName());
    }

    @Test
    public void testGetUserById_NotFound() {
        Optional<User> user = userService.getUserById(999L);
        assertFalse(user.isPresent());
    }

    @Test
    public void testCreateUser() {
        User newUser = new User(null, "Test User", "test@example.com");
        User created = userService.createUser(newUser);
        
        assertNotNull(created.getId());
        assertEquals("Test User", created.getName());
        assertEquals("test@example.com", created.getEmail());
    }

    @Test
    public void testUpdateUser() {
        User updatedUser = new User(null, "Updated Name", "updated@example.com");
        Optional<User> result = userService.updateUser(1L, updatedUser);
        
        assertTrue(result.isPresent());
        assertEquals("Updated Name", result.get().getName());
        assertEquals(1L, result.get().getId());
    }

    @Test
    public void testUpdateUser_NotFound() {
        User updatedUser = new User(null, "Updated Name", "updated@example.com");
        Optional<User> result = userService.updateUser(999L, updatedUser);
        
        assertFalse(result.isPresent());
    }

    @Test
    public void testDeleteUser() {
        boolean deleted = userService.deleteUser(1L);
        assertTrue(deleted);
        
        Optional<User> user = userService.getUserById(1L);
        assertFalse(user.isPresent());
    }

    @Test
    public void testDeleteUser_NotFound() {
        boolean deleted = userService.deleteUser(999L);
        assertFalse(deleted);
    }

    @Test
    public void testSearchUsers_ByName() {
        List<User> results = userService.searchUsers("john");
        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getName());
    }

    @Test
    public void testSearchUsers_ByEmail() {
        List<User> results = userService.searchUsers("jane@");
        assertEquals(1, results.size());
        assertEquals("Jane Smith", results.get(0).getName());
    }

    @Test
    public void testSearchUsers_NoResults() {
        List<User> results = userService.searchUsers("nonexistent");
        assertEquals(0, results.size());
    }
}
