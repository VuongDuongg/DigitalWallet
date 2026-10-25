package com.example.digital_wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class DigitalWalletApplication {

	public static void main(String[] args) {
		SpringApplication.run(DigitalWalletApplication.class, args);
	}

}
