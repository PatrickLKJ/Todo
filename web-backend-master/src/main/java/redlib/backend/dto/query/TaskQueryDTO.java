package redlib.backend.dto.query;

import lombok.Data;

@Data
public class TaskQueryDTO {
    /**
     * 用户ID
     */
    private Integer userId;
    
    /**
     * 搜索关键词
     */
    private String keyword;
    
    /**
     * 任务状态：true-已完成，false-未完成，null-全部
     */
    private Boolean completed;
    
    /**
     * 优先级：high, medium, low
     */
    private String priority;
    
    /**
     * 任务分类
     */
    private String category;
    
    /**
     * 截止日期范围：开始日期
     */
    private String dueDateStart;
    
    /**
     * 截止日期范围：结束日期
     */
    private String dueDateEnd;
} 