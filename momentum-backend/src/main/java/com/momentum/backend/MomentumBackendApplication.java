package com.momentum.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MomentumBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MomentumBackendApplication.class, args);
	}

}
