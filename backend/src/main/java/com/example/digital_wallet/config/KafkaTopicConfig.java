package com.example.digital_wallet.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String TOPIC_PAYMENT_REQUESTED = "payment.process.requested";
    public static final String TOPIC_PAYMENT_COMPLETED = "payment.process.completed";
    public static final String TOPIC_PAYMENT_FAILED = "payment.process.failed";

    @Bean
    public NewTopic paymentRequestedTopic() {
        return TopicBuilder.name(TOPIC_PAYMENT_REQUESTED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentCompletedTopic() {
        return TopicBuilder.name(TOPIC_PAYMENT_COMPLETED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentFailedTopic() {
        return TopicBuilder.name(TOPIC_PAYMENT_FAILED)
                .partitions(3)
                .replicas(1)
                .build();
    }
}

