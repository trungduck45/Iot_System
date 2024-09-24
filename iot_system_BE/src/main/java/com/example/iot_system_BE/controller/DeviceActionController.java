package com.example.iot_system_BE.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.iot_system_BE.entity.DeviceAction;
import com.example.iot_system_BE.service.DeviceActionService;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/device-action")
public class DeviceActionController {

    @Autowired
    private DeviceActionService deviceActionService;

    @GetMapping("")
    public List<DeviceAction> getAllDeviceAction(){
        return deviceActionService.getAllDeviceAction();
    }
}
