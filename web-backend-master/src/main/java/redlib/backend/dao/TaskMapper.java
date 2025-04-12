package redlib.backend.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import redlib.backend.model.Task;
import redlib.backend.dto.query.TaskQueryDTO;
import java.util.List;

@Mapper
public interface TaskMapper {
    @Select("SELECT * FROM task WHERE user_id = #{userId}")
    @ResultMap("BaseResultMap")
    List<Task> selectByUserId(Integer userId);
    
    @Select("SELECT * FROM task WHERE user_id IS NULL")
    @ResultMap("BaseResultMap")
    List<Task> selectTasksWithoutOwner();
    
    List<Task> selectAll();
    
    Task selectByPrimaryKey(Integer id);
    
    int insert(Task task);
    int updateByPrimaryKey(Task task);
    int deleteByPrimaryKey(Integer id);
    
    List<Task> search(TaskQueryDTO queryDTO);
}