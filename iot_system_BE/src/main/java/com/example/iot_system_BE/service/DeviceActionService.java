package com.example.iot_system_BE.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.iot_system_BE.entity.DeviceAction;
import com.example.iot_system_BE.repository.DeviceActionRepository;

@Service
public class DeviceActionService {

    @Autowired
    private DeviceActionRepository deviceActionRepository;

    public List<DeviceAction> getAllDeviceAction(){
        return deviceActionRepository.findAll();
    }
}
