package com.rentfair;

import com.rentfair.config.SerpApiProperties;
import com.rentfair.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HealthControllerTest {

    @Test
    void testHealthEndpointReturnsUpStatus() throws Exception {
        SerpApiProperties properties = new SerpApiProperties();
        properties.setApiKey("test-key");
        properties.setEngine("google");
        properties.setTimeoutSeconds(15);

        DataSource mockDataSource = mock(DataSource.class);
        Connection mockConnection = mock(Connection.class);
        DatabaseMetaData mockMetaData = mock(DatabaseMetaData.class);

        when(mockDataSource.getConnection()).thenReturn(mockConnection);
        when(mockConnection.getMetaData()).thenReturn(mockMetaData);
        when(mockMetaData.getDatabaseProductName()).thenReturn("H2");

        HealthController controller = new HealthController(properties, mockDataSource);
        ResponseEntity<Map<String, Object>> response = controller.health();

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("UP", body.get("status"));
        assertEquals("0.1.0", body.get("version"));

        @SuppressWarnings("unchecked")
        Map<String, Object> serpApi = (Map<String, Object>) body.get("serpApi");
        assertNotNull(serpApi);
        assertEquals(true, serpApi.get("configured"));

        @SuppressWarnings("unchecked")
        Map<String, Object> db = (Map<String, Object>) body.get("database");
        assertNotNull(db);
        assertEquals("UP", db.get("status"));
        assertEquals("H2", db.get("databaseProduct"));
    }
}
