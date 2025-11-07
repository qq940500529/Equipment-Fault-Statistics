Sub 整理数据() ' 工作表对象
Dim ws As Worksheet
Dim wsNew As Worksheet
Dim wsOriginal As Worksheet

' 数据行数相关
Dim lastRow As Long                    ' 最后一个数据行的行号
Dim firstDataRow As Long               ' 第一个数据行的行号

' 时间相关列索引
Dim startTimeCol As Long               ' 维修开始时间列索引
Dim endTimeCol As Long                 ' 维修结束时间列索引
Dim reportTimeCol As Long              ' 报修时间列索引

' 其他数据列索引
Dim workOrderCol As Long               ' 工单号列索引
Dim workshopCol As Long                ' 车间列索引
Dim areaCol As Long                    ' 区域列索引（新增）
Dim repairPersonCol As Long            ' 维修人列索引（新增）
Dim repairPersonTypeCol As Long        ' 维修人分类列索引（新增）

' 计算列索引
Dim waitTimeCol As Long                ' 等待时间列索引
Dim repairTimeCol As Long              ' 维修时间列索引
Dim faultTimeCol As Long               ' 故障时间列索引

' 循环变量
Dim i As Long                          ' 通用循环计数器
Dim j As Long                          ' 维修人分类循环计数器（新增）

' 日期时间变量
Dim startTime As Variant               ' 维修开始时间
Dim endTime As Variant                 ' 维修结束时间
Dim reportTime As Variant              ' 报修时间

' 时间计算变量（小时）
Dim waitTime As Double                 ' 等待时间（小时）
Dim repairTime As Double               ' 维修时间（小时）
Dim faultTime As Double                ' 故障时间（小时）

' 状态控制变量
Dim foundValidDate As Boolean          ' 是否找到有效日期的标志

' 车间分列相关变量
Dim workshopValue As String            ' 车间列的原始值
Dim splitValues() As String            ' 按"-"分割后的字符串数组

' 删除行相关变量
Dim deletedRowsCount As Long           ' 删除的行数计数
Dim deletedTimeRowsCount As Long       ' 删除的时间不完整行数计数（新增）

' 区域列检测变量
Dim hasAreaColumn As Boolean           ' 是否已存在区域列
Dim originalAreaCol As Long            ' 原始区域列位置

' 维修人分类相关变量（新增）
Dim hasRepairPersonTypeColumn As Boolean ' 是否已存在维修人分类列
Dim originalRepairPersonTypeCol As Long  ' 原始维修人分类列位置
Dim repairPersonValue As String        ' 维修人列的原始值
Dim repairPersonType As String         ' 维修人分类结果

' 维修人员分类数组（新增）
Dim repairWorkers() As String          ' 维修工数组
Dim electricians() As String           ' 电工数组

' 初始化维修人员分类数组（新增）
repairWorkers = Split("王兴森,孙长青,徐阴海,任扶民,吴长振,张玉柱,刘志强,杨明印,张金华,刘金财,崔树立,杨致敬,马圣强,刘子凯,何洪杰,刘佳文", ",")
electricians = Split("李润海,赵艳伟,吴霄,吴忠建,李之彦,宋桂良,崔金辉,李瑞召,万庆权,郭瑞臣,郭兆勤,赵同宽,肖木凯,赵燕伟", ",")

' 设置原始数据工作表
On Error Resume Next
Set wsOriginal = ThisWorkbook.Worksheets("原始数据")
On Error GoTo 0

If wsOriginal Is Nothing Then
    MsgBox "未找到'原始数据'表！", vbExclamation
    Exit Sub
End If

' 检查是否已存在"整理后数据"表
On Error Resume Next
Set wsNew = ThisWorkbook.Worksheets("整理后数据")
On Error GoTo 0

If wsNew Is Nothing Then
    ' 如果不存在，则在"原始数据"表后新建"整理后数据"表
    Set wsNew = ThisWorkbook.Worksheets.Add(After:=wsOriginal)
    wsNew.Name = "整理后数据"
Else
    ' 如果存在，则清空所有内容
    wsNew.Cells.Clear
End If

' 复制原始数据到新表
wsOriginal.UsedRange.Copy wsNew.Range("A1")

' 设置当前工作表为新创建的工作表
Set ws = wsNew

' 清除所有筛选状态
If ws.AutoFilterMode Then
    ws.AutoFilterMode = False
End If

' 第一步：查找车间列和检查是否已存在区域列
workshopCol = 0
originalAreaCol = 0
hasAreaColumn = False
repairPersonCol = 0
originalRepairPersonTypeCol = 0
hasRepairPersonTypeColumn = False

For i = 1 To ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column
    If ws.Cells(1, i).Value = "车间" Then
        workshopCol = i
    ElseIf ws.Cells(1, i).Value = "区域" Then
        originalAreaCol = i
        hasAreaColumn = True
    ElseIf ws.Cells(1, i).Value = "维修人" Then
        repairPersonCol = i
    ElseIf ws.Cells(1, i).Value = "维修人分类" Then
        originalRepairPersonTypeCol = i
        hasRepairPersonTypeColumn = True
    End If
Next i

' 检查是否找到了车间列
If workshopCol = 0 Then
    MsgBox "未找到'车间'列！", vbExclamation
    Exit Sub
End If

' 检查是否找到了维修人列（新增）
If repairPersonCol = 0 Then
    MsgBox "未找到'维修人'列！", vbExclamation
    Exit Sub
End If

' 第二步：如果没有区域列，则在车间列后插入区域列
If Not hasAreaColumn Then
    areaCol = workshopCol + 1
    ws.Columns(areaCol).Insert Shift:=xlToRight
    ws.Cells(1, areaCol).Value = "区域"
Else
    areaCol = originalAreaCol
End If

' 第三步：如果没有维修人分类列，则在维修人列后插入维修人分类列（新增）
If Not hasRepairPersonTypeColumn Then
    repairPersonTypeCol = repairPersonCol + 1
    ws.Columns(repairPersonTypeCol).Insert Shift:=xlToRight
    ws.Cells(1, repairPersonTypeCol).Value = "维修人分类"
Else
    repairPersonTypeCol = originalRepairPersonTypeCol
End If

' 第四步：重新建立所有列的索引（因为可能插入了新列）
startTimeCol = 0
endTimeCol = 0
workOrderCol = 0
reportTimeCol = 0
waitTimeCol = 0
repairTimeCol = 0
faultTimeCol = 0
workshopCol = 0
areaCol = 0
repairPersonCol = 0
repairPersonTypeCol = 0

For i = 1 To ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column
    Select Case ws.Cells(1, i).Value
        Case "维修开始时间"
            startTimeCol = i
        Case "维修结束时间"
            endTimeCol = i
        Case "工单号"
            workOrderCol = i
        Case "报修时间"
            reportTimeCol = i
        Case "等待时间h"
            waitTimeCol = i
        Case "维修时间h"
            repairTimeCol = i
        Case "故障时间h"
            faultTimeCol = i
        Case "车间"
            workshopCol = i
        Case "区域"
            areaCol = i
        Case "维修人"
            repairPersonCol = i
        Case "维修人分类"
            repairPersonTypeCol = i
    End Select
Next i

' 检查是否找到了所需的列
If startTimeCol = 0 Then
    MsgBox "未找到'维修开始时间'列！", vbExclamation
    Exit Sub
End If

If endTimeCol = 0 Then
    MsgBox "未找到'维修结束时间'列！", vbExclamation
    Exit Sub
End If

If workOrderCol = 0 Then
    MsgBox "未找到'工单号'列！", vbExclamation
    Exit Sub
End If

If reportTimeCol = 0 Then
    MsgBox "未找到'报修时间'列！", vbExclamation
    Exit Sub
End If

If workshopCol = 0 Then
    MsgBox "未找到'车间'列！", vbExclamation
    Exit Sub
End If

If areaCol = 0 Then
    MsgBox "未找到'区域'列！", vbExclamation
    Exit Sub
End If

If repairPersonCol = 0 Then
    MsgBox "未找到'维修人'列！", vbExclamation
    Exit Sub
End If

If repairPersonTypeCol = 0 Then
    MsgBox "未找到'维修人分类'列！", vbExclamation
    Exit Sub
End If

' 如果时间计算列不存在，则创建
If waitTimeCol = 0 Then
    waitTimeCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column + 1
    ws.Cells(1, waitTimeCol).Value = "等待时间h"
End If

If repairTimeCol = 0 Then
    repairTimeCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column + 1
    ws.Cells(1, repairTimeCol).Value = "维修时间h"
End If

If faultTimeCol = 0 Then
    faultTimeCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column + 1
    ws.Cells(1, faultTimeCol).Value = "故障时间h"
End If

' 找到第一个工单号不为空的行（从第二行开始）
firstDataRow = 2
Do While (ws.Cells(firstDataRow, workOrderCol).Value = "" Or IsEmpty(ws.Cells(firstDataRow, workOrderCol))) And firstDataRow <= ws.Rows.Count
    firstDataRow = firstDataRow + 1
Loop

' 检查是否找到了数据
If firstDataRow > ws.Rows.Count Then
    MsgBox "未找到有效的工单号数据！", vbExclamation
    Exit Sub
End If

' 找到工单号列的最后一个非空行
lastRow = ws.Cells(ws.Rows.Count, workOrderCol).End(xlUp).Row

' 确保lastRow不小于firstDataRow
If lastRow < firstDataRow Then
    lastRow = firstDataRow
End If

' 删除车间列为"合计"的行（从后往前删除）
deletedRowsCount = 0
For i = lastRow To 1 Step -1
    ' 检查车间列是否为"合计"
    If ws.Cells(i, workshopCol).Value = "合计" Then
        ws.Rows(i).Delete
        deletedRowsCount = deletedRowsCount + 1
    End If
Next i

' 重新计算firstDataRow和lastRow（因为删除了行）
firstDataRow = 2
Do While (ws.Cells(firstDataRow, workOrderCol).Value = "" Or IsEmpty(ws.Cells(firstDataRow, workOrderCol))) And firstDataRow <= ws.Rows.Count
    firstDataRow = firstDataRow + 1
Loop

' 检查是否找到了数据
If firstDataRow > ws.Rows.Count Then
    MsgBox "删除合计行后未找到有效的工单号数据！", vbExclamation
    Exit Sub
End If

' 重新计算lastRow
lastRow = ws.Cells(ws.Rows.Count, workOrderCol).End(xlUp).Row

' 确保lastRow不小于firstDataRow
If lastRow < firstDataRow Then
    lastRow = firstDataRow
End If

' 处理车间列分列（只有在没有原始区域列时才进行）
If Not hasAreaColumn Then
    For i = firstDataRow To lastRow
        ' 只处理工单号不为空的行
        If ws.Cells(i, workOrderCol).Value <> "" And Not IsEmpty(ws.Cells(i, workOrderCol)) Then
            workshopValue = ws.Cells(i, workshopCol).Value
            
            ' 如果车间值不为空且包含"-"
            If workshopValue <> "" And InStr(workshopValue, "-") > 0 Then
                ' 按"-"分割
                splitValues = Split(workshopValue, "-")
                
                ' 第一列仍为车间（取分割后的第一部分）
                ws.Cells(i, workshopCol).Value = Trim(splitValues(0))
                
                ' 第二列为区域（取分割后的第二部分，如果存在）
                If UBound(splitValues) >= 1 Then
                    ws.Cells(i, areaCol).Value = Trim(splitValues(1))
                Else
                    ws.Cells(i, areaCol).Value = ""
                End If
            Else
                ' 如果不包含"-"，区域列设为空
                ws.Cells(i, areaCol).Value = ""
            End If
        End If
    Next i
End If

' 处理维修人分类（只有在没有原始维修人分类列时才进行）（新增）
If Not hasRepairPersonTypeColumn Then
    For i = firstDataRow To lastRow
        ' 只处理工单号不为空的行
        If ws.Cells(i, workOrderCol).Value <> "" And Not IsEmpty(ws.Cells(i, workOrderCol)) Then
            repairPersonValue = ws.Cells(i, repairPersonCol).Value
            repairPersonType = ""
            
            ' 如果维修人值不为空，则进行分类
            If repairPersonValue <> "" Then
                ' 检查是否为维修工
                For j = LBound(repairWorkers) To UBound(repairWorkers)
                    If Trim(repairWorkers(j)) = Trim(repairPersonValue) Then
                        repairPersonType = "维修工"
                        Exit For
                    End If
                Next j
                
                ' 如果不是维修工，检查是否为电工
                If repairPersonType = "" Then
                    For j = LBound(electricians) To UBound(electricians)
                        If Trim(electricians(j)) = Trim(repairPersonValue) Then
                            repairPersonType = "电工"
                            Exit For
                        End If
                    Next j
                End If
                
                ' 如果都不匹配，设为"未知"
                If repairPersonType = "" Then
                    repairPersonType = "未知"
                End If
            End If
            
            ' 设置维修人分类
            ws.Cells(i, repairPersonTypeCol).Value = repairPersonType
        End If
    Next i
End If

' 计算时间并删除时间不完整的行（修改）
deletedTimeRowsCount = 0
For i = lastRow To firstDataRow Step -1
    ' 只处理工单号不为空的行
    If ws.Cells(i, workOrderCol).Value <> "" And Not IsEmpty(ws.Cells(i, workOrderCol)) Then
        ' 获取时间值
        startTime = ws.Cells(i, startTimeCol).Value
        endTime = ws.Cells(i, endTimeCol).Value
        reportTime = ws.Cells(i, reportTimeCol).Value
        
        ' 检查时间是否完整且有效
        If startTime <> "" And Not IsEmpty(startTime) And _
           endTime <> "" And Not IsEmpty(endTime) And _
           reportTime <> "" And Not IsEmpty(reportTime) And _
           IsDate(startTime) And IsDate(endTime) And IsDate(reportTime) Then
            
            ' 转换为日期类型
            startTime = CDate(startTime)
            endTime = CDate(endTime)
            reportTime = CDate(reportTime)
            
            ' 计算等待时间（小时）
            waitTime = (startTime - reportTime) * 24 ' 转换为小时
            ws.Cells(i, waitTimeCol).Value = Round(waitTime, 2)
            
            ' 计算维修时间（小时）
            repairTime = (endTime - startTime) * 24 ' 转换为小时
            ws.Cells(i, repairTimeCol).Value = Round(repairTime, 2)
            
            ' 计算故障时间（小时）
            faultTime = waitTime + repairTime
            ws.Cells(i, faultTimeCol).Value = Round(faultTime, 2)
        Else
            ' 如果时间不完整，删除该行
            ws.Rows(i).Delete
            deletedTimeRowsCount = deletedTimeRowsCount + 1
        End If
    End If
Next i

' 重新计算lastRow（因为删除了行）
lastRow = ws.Cells(ws.Rows.Count, workOrderCol).End(xlUp).Row

' 确保lastRow不小于firstDataRow
If lastRow < firstDataRow Then
    lastRow = firstDataRow
End If

' 设置格式
ws.Columns(startTimeCol).NumberFormat = "yyyy-mm-dd hh:mm:ss"
ws.Columns(endTimeCol).NumberFormat = "yyyy-mm-dd hh:mm:ss"
ws.Columns(reportTimeCol).NumberFormat = "yyyy-mm-dd hh:mm:ss"
ws.Columns(waitTimeCol).NumberFormat = "0.00"
ws.Columns(repairTimeCol).NumberFormat = "0.00"
ws.Columns(faultTimeCol).NumberFormat = "0.00"

' 自动调整所有列宽适应内容（新增）
ws.Columns.AutoFit

' 构建完成消息
Dim completionMessage As String
completionMessage = "处理完成！" & vbCrLf & _
                   "处理的行数：" & (lastRow - firstDataRow + 1) & vbCrLf & _
                   "删除的'合计'行数：" & deletedRowsCount & vbCrLf & _
                   "删除的时间不完整行数：" & deletedTimeRowsCount & vbCrLf & _
                   "已计算等待时间、维修时间和故障时间"

' 根据是否进行车间分列添加相应消息
If hasAreaColumn Then
    completionMessage = completionMessage & vbCrLf & "检测到已存在区域列，跳过车间分列"
Else
    completionMessage = completionMessage & vbCrLf & "已按'-'分列车间列，新增区域列"
End If

' 根据是否进行维修人分类添加相应消息（新增）
If hasRepairPersonTypeColumn Then
    completionMessage = completionMessage & vbCrLf & "检测到已存在维修人分类列，跳过维修人分类"
Else
    completionMessage = completionMessage & vbCrLf & "已新增维修人分类列，按维修工/电工/未知分类"
End If

MsgBox completionMessage, vbInformation
End Sub
