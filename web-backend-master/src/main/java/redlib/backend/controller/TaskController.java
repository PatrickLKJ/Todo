package redlib.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.common.PageResult;
import redlib.backend.model.Task;
import redlib.backend.service.TaskService;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@BackendModule("任务管理")
@CrossOrigin
public class TaskController {
    @Autowired
    private TaskService taskService;
    
    @GetMapping
    @Privilege
    public ResponseEntity<?> getAllTasks() {
        try {
            return ResponseEntity.ok(taskService.getAllTasks());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("获取任务列表失败: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    @Privilege
    public ResponseEntity<?> getTaskById(@PathVariable("id") Integer id) {
        try {
            Task task = taskService.getTaskById(id);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(task);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("获取任务详情失败: " + e.getMessage());
        }
    }
    
    @PostMapping
    @Privilege
    public ResponseEntity<?> createTask(@RequestBody Task task) {
        try {
            taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(task);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("创建任务失败: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @Privilege
    public ResponseEntity<?> updateTask(@PathVariable("id") Integer id, @RequestBody Task task) {
        try {
            task.setId(id);
            taskService.updateTask(task);
            return ResponseEntity.ok(task);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("更新任务失败: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @Privilege
    public ResponseEntity<?> deleteTask(@PathVariable("id") Integer id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("删除任务失败: " + e.getMessage());
        }
    }
    
    /**
     * 分页查询任务列表
     */
    @GetMapping("/page")
    @Privilege
    public ResponseEntity<?> getTasksByPage(
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "userId", required = false) Integer userId) {
        try {
            PageResult<Task> result = taskService.getTasksByPage(pageNum, pageSize, userId);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("分页获取任务失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户的任务列表
     */
    @GetMapping("/user/{userId}")
    @Privilege
    public ResponseEntity<?> getTasksByUserId(@PathVariable("userId") Integer userId) {
        try {
            return ResponseEntity.ok(taskService.getTasksByUserId(userId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("获取用户任务失败: " + e.getMessage());
        }
    }
}