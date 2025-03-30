package redlib.backend.model;

import java.util.Date;
import lombok.Data;

/**
 * 描述:user表的实体类
 * @version
 * @author:  11983
 * @创建时间: 2025-03-25
 */
@Data
public class User {
    /**
     * 
     */
    private Integer id;

    /**
     * 登录账号
     */
    private String username;

    /**
     * 加密后的密码
     */
    private String password;

    /**
     * 显示名称
     */
    private String nickname;

    /**
     * 
     */
    private Date createdAt;
}