package com.example.iot_system_BE.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.iot_system_BE.entity.DeviceAction;
import com.example.iot_system_BE.repository.DeviceActionRepository;
import com.example.iot_system_BE.service.DeviceActionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping
public class DeviceActionController {

    @Autowired
    private DeviceActionService deviceActionService;

    @GetMapping("/api/device-action")
    public List<DeviceAction> getAllDeviceAction(){
        return deviceActionService.getAllDeviceAction();
    }

    private final DeviceActionRepository repository;

    public DeviceActionController(DeviceActionRepository repository) {
        this.repository = repository;
    }
    @GetMapping("/api/device-action/search")
   public List<DeviceAction> searchData(
            @RequestParam String type, 
            @RequestParam String value) {

        switch (type) {
           
            case "date":
                return repository.findByExactTimestamp(value);
            default:
                throw new IllegalArgumentException("Loại tìm kiếm không hợp lệ: " + type);
        }
    }
    

}
