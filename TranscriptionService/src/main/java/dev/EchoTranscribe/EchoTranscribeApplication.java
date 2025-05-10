package dev.EchoTranscribe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableEurekaServer
@EnableDiscoveryClient
@SpringBootApplication(exclude = MongoDataAutoConfiguration.class)
@EnableMongoRepositories(basePackages = "dev.EchoTranscribe.segments")
@EnableJdbcRepositories(basePackages = {
    "dev.EchoTranscribe.transcripts",
	"dev.EchoTranscribe.records",
	"dev.EchoTranscribe.summaries"
})
public class EchoTranscribeApplication {

	public static void main(String[] args) {
		SpringApplication.run(EchoTranscribeApplication.class, args);
	}

}
