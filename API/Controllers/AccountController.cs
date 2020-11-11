using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly DataContext _context;
        public ITokenService _tokenService;
        private readonly IMapper _mapper;
        public AccountController(DataContext context, ITokenService tokenService, IMapper mapper)
        {
            this._mapper = mapper;
            this._tokenService = tokenService;
            this._context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDTO>> Register(RegisterDTO oDTORegister)
        {
            if (await UserExists(oDTORegister.Username))
            {
                return BadRequest("UserName is taken");
            }

            var user = _mapper.Map<AppUser>(oDTORegister);

            using HMACSHA512 hmac = new HMACSHA512();

            user.UserName = oDTORegister.Username.ToLower();
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(oDTORegister.Password));
            user.PasswordSalt = hmac.Key;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new UserDTO() { Username = user.UserName, Token = _tokenService.CreateToken(user), KnownAs = user.KnownAs};
        }

        private async Task<bool> UserExists(string UserName)
        {
            return await _context.Users.AnyAsync(x => x.UserName == UserName.ToLower());
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(LoginDTO oDTOLogin)
        {
            AppUser user = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync<AppUser>(x => x.UserName == oDTOLogin.Username);

            if (user == null)
                return Unauthorized("Invalid username");

            using var hmac = new HMACSHA512(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(oDTOLogin.Password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                    return Unauthorized("Invalid password");
            }

            return new UserDTO() { Username = user.UserName, Token = _tokenService.CreateToken(user), PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url, KnownAs = user.KnownAs };
        }
    }
}