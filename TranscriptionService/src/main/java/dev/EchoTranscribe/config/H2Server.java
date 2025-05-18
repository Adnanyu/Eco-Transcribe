package dev.EchoTranscribe.config;
import org.h2.tools.Server;


import java.sql.SQLException;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class H2Server {
    
    private Server h2Server;

    @PostConstruct
    public void startH2Server() throws SQLException {
        h2Server = Server.createTcpServer("-tcp", "-tcpAllowOthers", "-tcpPort", "9090").start();
        System.out.println("H2 Database Server started on TCP port 9092");
    }

    @PreDestroy
    public void stopH2Server() {
        if (h2Server != null) {
            h2Server.stop();
            System.out.println("H2 Database Server stopped");
        }
    }
}
