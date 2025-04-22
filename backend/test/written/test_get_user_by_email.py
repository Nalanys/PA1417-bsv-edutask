import pytest
from unittest.mock import patch, MagicMock

from src.controllers.usercontroller import UserController

class TestGetUserByEmail:
    def test_1(self):
        email = 'user@example.com'
        user = {'firstName': 'John', 'lastName': 'Doe', 'email': email}

        mockedDAO = MagicMock()
        mockedDAO.find.return_value = [user]
        uc = UserController(dao=mockedDAO)

        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = True
            assert uc.get_user_by_email(email=email) == user
    
    def test_2(self):
        email = 'user@example.com'
        mockedDAO = MagicMock()
        mockedDAO.find.return_value = []
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = True
            assert uc.get_user_by_email(email=email) is None

    def test_3(self):
        email = 'user@example.com'
        user1 = {'firstName': 'John', 'lastName': 'Doe', 'email': email}
        user2 = {'firstName': 'Jane', 'lastName': 'Doe', 'email': email}
        mockedDAO = MagicMock()
        mockedDAO.find.return_value = [user1]
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = True
            assert uc.get_user_by_email(email=email) == user1

    def test_4(self):
        email = 'userexample.com'
        mockedDAO = MagicMock()
        mockedDAO.find.return_value = []
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = False
            with pytest.raises(ValueError):
                uc.get_user_by_email(email=email)
        
    def test_5(self):
        email = 'user@'
        mockedDAO = MagicMock()
        mockedDAO.find.return_value = []
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = False
            with pytest.raises(ValueError):
                uc.get_user_by_email(email=email)
    
    def test_6(self):
        email = '@example.com'
        mockedDAO = MagicMock()
        mockedDAO.find.return_value = []
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = False
            with pytest.raises(ValueError):
                uc.get_user_by_email(email=email)

    def test_7(self):
        email = ''
        mockedDAO = MagicMock()
        mockedDAO.find.return_value = []
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = False
            with pytest.raises(ValueError):
                uc.get_user_by_email(email=email)

    def test_8(self):
        email = 'user@example.com'
        mockedDAO = MagicMock()
        mockedDAO.find.side_effect = Exception('Database error')
        uc = UserController(dao=mockedDAO)
        with patch('src.controllers.usercontroller.re.fullmatch') as mockfullmatch:
            mockfullmatch.return_value = True
            with pytest.raises(Exception):
                uc.get_user_by_email(email=email)
                