package redlib.backend.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import redlib.backend.common.PageResult;
import redlib.backend.dao.TaskMapper;
import redlib.backend.model.Task;
import redlib.backend.model.Token;
import redlib.backend.utils.ThreadContextHolder;

import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskMapper taskMapper;
    
    public List<Task> getAllTasks() {
        // 权限验证 - 只有管理员可以查看所有任务
        Token currentUser = ThreadContextHolder.getToken();
        if (isAdminUser(currentUser)) {
            return taskMapper.selectAll();
        } else {
            // 普通用户只能查看自己的任务
            return taskMapper.selectByUserId(currentUser.getUserId());
        }
    }
    
    /**
     * 根据ID获取任务详情
     * @param id 任务ID
     * @return 任务详情
     */
    public Task getTaskById(Integer id) {
        Task task = taskMapper.selectByPrimaryKey(id);
        if (task != null) {
            System.out.println("从数据库加载任务 - ID: " + task.getId() + ", 标题: " + task.getTitle() + ", 所有者ID: " + task.getUserId());
            // 验证当前用户是否有权查看该任务
            verifyTaskAccess(task);
        }
        return task;
    }
    
    public int createTask(Task task) {
        // 设置当前用户为任务创建者
        Token currentUser = ThreadContextHolder.getToken();
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new IllegalStateException("无法获取当前用户信息，创建任务失败");
        }
        
        // 确保设置正确的用户ID
        task.setUserId(currentUser.getUserId());
        System.out.println("创建任务，设置用户ID: " + currentUser.getUserId());
        
        // 验证并设置默认值
        validateAndSetDefaults(task);
        
        try {
            return taskMapper.insert(task);
        } catch (Exception e) {
            System.err.println("创建任务失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public int updateTask(Task task) {
        // 验证当前用户是否有权修改该任务
        Task existingTask = taskMapper.selectByPrimaryKey(task.getId());
        if (existingTask != null) {
            verifyTaskAccess(existingTask);
            
            // 添加调试信息
            System.out.println("更新任务前 - 任务ID: " + existingTask.getId() + 
                              ", 原始用户ID: " + existingTask.getUserId() + 
                              ", 提交的用户ID: " + task.getUserId());
            
            // 确保保留原始的用户ID，不允许更改任务所有者
            task.setUserId(existingTask.getUserId());
            
            // 验证并设置默认值
            validateAndSetDefaults(task);
            
            try {
                return taskMapper.updateByPrimaryKey(task);
            } catch (Exception e) {
                System.err.println("更新任务失败: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        } else {
            throw new IllegalArgumentException("要更新的任务不存在");
        }
    }
    
    /**
     * 删除任务
     * @param id 任务ID
     * @return 操作结果
     */
    public int deleteTask(Integer id) {
        // 1. 先根据ID获取任务
        Task existingTask = taskMapper.selectByPrimaryKey(id);
        if (existingTask != null) {
            // 添加调试信息
            Token currentUser = ThreadContextHolder.getToken();
            System.out.println("删除任务 ID: " + id + ", 任务所有者 ID: " + existingTask.getUserId() + ", 当前用户 ID: " + currentUser.getUserId());
            System.out.println("当前用户是否为管理员: " + isAdminUser(currentUser));

            // 2. 验证当前用户是否有权限删除此任务
            try {
                verifyTaskAccess(existingTask);
                // 3. 如果有权限，则执行删除
                return taskMapper.deleteByPrimaryKey(id);
            } catch (SecurityException e) {
                System.err.println("权限验证失败: " + e.getMessage());
                throw e;
            }
        } else {
            throw new IllegalArgumentException("要删除的任务不存在");
        }
    }
    
    // 验证并设置默认值
    private void validateAndSetDefaults(Task task) {
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("任务标题不能为空");
        }
        
        // 确保completed不为null
        if (task.getCompleted() == null) {
            task.setCompleted(false);
        }
        
        // 设置优先级默认值
        if (task.getPriority() == null || task.getPriority().trim().isEmpty()) {
            task.setPriority("medium");
        }
        
        // 设置分类默认值
        if (task.getCategory() == null || task.getCategory().trim().isEmpty()) {
            task.setCategory("work");
        }
    }
    
    /**
     * 根据用户ID查询任务列表
     * @param userId 用户ID
     * @return 任务列表
     */
    public List<Task> getTasksByUserId(Integer userId) {
        // 权限验证 - 用户只能查看自己的任务
        Token currentUser = ThreadContextHolder.getToken();
        if (isAdminUser(currentUser) || currentUser.getUserId().equals(userId)) {
            return taskMapper.selectByUserId(userId);
        } else {
            // 非管理员用户不能查看他人任务
            return taskMapper.selectByUserId(currentUser.getUserId());
        }
    }
    
    /**
     * 分页查询任务列表
     * @param pageNum 当前页码
     * @param pageSize 每页大小
     * @param userId 用户ID
     * @return 分页结果
     */
    public PageResult<Task> getTasksByPage(int pageNum, int pageSize, Integer requestedUserId) {
        // 获取当前登录用户信息
        Token currentUser = ThreadContextHolder.getToken();
        
        // 确定要查询的用户ID
        Integer userIdToQuery;
        
        // 如果是管理员，可以查看指定用户的任务
        if (isAdminUser(currentUser)) {
            userIdToQuery = requestedUserId; // 可以是null，表示查看所有任务
        } else {
            // 非管理员只能查看自己的任务，忽略请求中的userId
            userIdToQuery = currentUser.getUserId();
        }
        
        // 设置分页参数
        PageHelper.startPage(pageNum, pageSize);
        
        // 执行查询
        List<Task> tasks;
        if (userIdToQuery != null) {
            tasks = taskMapper.selectByUserId(userIdToQuery);
        } else {
            // 只有管理员能查看所有任务
            tasks = taskMapper.selectAll();
        }
        
        // 获取分页信息
        PageInfo<Task> pageInfo = new PageInfo<>(tasks);
        
        // 构建返回结果
        return new PageResult<>(
            pageInfo.getList(),
            pageInfo.getTotal(),
            pageInfo.getPageNum(),
            pageInfo.getPageSize()
        );
    }
    
    // 权限验证方法
    private void verifyTaskAccess(Task task) {
        // 获取当前登录用户
        Token currentUser = ThreadContextHolder.getToken();
        
        // 如果任务没有所有者（userId为null）
        if (task.getUserId() == null) {
            System.err.println("警告: 任务ID " + task.getId() + " 没有所有者(userId=null)");
            
            // 只有管理员可以访问没有所有者的任务
            if (!isAdminUser(currentUser)) {
                throw new SecurityException("您没有权限访问此任务（任务没有所有者）");
            }
        } 
        // 如果任务有所有者，检查当前用户是否有权限
        else if (!isAdminUser(currentUser) && !task.getUserId().equals(currentUser.getUserId())) {
            throw new SecurityException("您没有权限访问此任务");
        }
    }
    
    // 检查用户是否为管理员
    private boolean isAdminUser(Token user) {
        // 根据您的系统设计判断用户是否为管理员
        // 例如：root用户或拥有特定权限的用户
        return "root".equals(user.getUserCode()) || 
               (user.getPrivSet() != null && user.getPrivSet().contains("admin"));
    }
    
    /**
     * 管理员方法：修复没有所有者的任务
     * @param defaultUserId 默认用户ID
     * @return 修复的任务数量
     */
    public int fixTasksWithoutOwner(Integer defaultUserId) {
        Token currentUser = ThreadContextHolder.getToken();
        
        // 只有管理员可以执行此操作
        if (!isAdminUser(currentUser)) {
            throw new SecurityException("只有管理员可以执行此操作");
        }
        
        if (defaultUserId == null) {
            throw new IllegalArgumentException("默认用户ID不能为空");
        }
        
        // 查找所有没有所有者的任务
        List<Task> tasksWithoutOwner = taskMapper.selectTasksWithoutOwner();
        int count = 0;
        
        for (Task task : tasksWithoutOwner) {
            task.setUserId(defaultUserId);
            try {
                taskMapper.updateByPrimaryKey(task);
                count++;
                System.out.println("已修复任务 ID: " + task.getId() + ", 设置所有者 ID: " + defaultUserId);
            } catch (Exception e) {
                System.err.println("修复任务失败 ID: " + task.getId() + ", 错误: " + e.getMessage());
            }
        }
        
        return count;
    }
}