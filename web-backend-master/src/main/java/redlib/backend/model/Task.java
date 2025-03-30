package redlib.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;
import lombok.Data;

/**
 * 描述:task表的实体类
 * @version
 * @author:  11983
 * @创建时间: 2025-03-25
 */
@Data
public class Task {
    /**
     * 
     */
    private Integer id;

    /**
     * 所属用户ID
     */
    private Integer userId;

    /**
     * 
     */
    private String title;

    /**
     * 是否完成
     */
    private Boolean completed;

    /**
     * 截止日期
     * 使用String类型保持与前端一致，避免日期格式转换问题
     */
    private String dueDate;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createdAt;

    /**
     * 
     */
    private String description;

    /**
     * 优先级：high, medium, low
     */
    private String priority;
    
    /**
     * 任务分类
     */
    private String category;
}