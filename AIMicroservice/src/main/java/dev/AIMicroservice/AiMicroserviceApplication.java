package dev.AIMicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AiMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AiMicroserviceApplication.class, args);
	}

}
