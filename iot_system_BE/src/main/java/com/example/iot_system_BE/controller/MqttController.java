package com.example.iot_system_BE.controller;

import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.iot_system_BE.entity.PublishRequest;
import com.example.iot_system_BE.service.MqttPublisherService;

@RestController
@RequestMapping("/api")
public class MqttController {

    @Autowired
    private MqttPublisherService mqttPublisherService;

    @PostMapping("/publish")
    public ResponseEntity<String> publishMessage(@RequestBody PublishRequest request) {
        try {
            mqttPublisherService.publish(request.getTopic(), request.getMessage());
            return ResponseEntity.ok("Message published successfully");
        } catch (MqttException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to publish message: " + e.getMessage());
        }
    }
}
